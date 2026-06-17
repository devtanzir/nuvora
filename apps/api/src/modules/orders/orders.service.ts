import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, DiscountType, Prisma } from '@prisma/client';
import Stripe from 'stripe';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RefundRequestDto } from './dto/refund-request.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';
import { ValidatePromoCodeDto } from '../promo-codes/dto/validate-promo-code.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { InvoiceService } from './invoice.service';

@Injectable()
export class OrdersService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly invoiceService: InvoiceService,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow('STRIPE_SECRET_KEY'),
    );
  }

  // ============================================================
  // Validate Promo Code (Public)
  // ============================================================
  async validatePromoCode(dto: ValidatePromoCodeDto) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: dto.code },
    });

    if (!promo || !promo.isActive) {
      throw new BadRequestException('Invalid promo code');
    }
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      throw new BadRequestException('Promo code expired');
    }
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      throw new BadRequestException('Usage limit reached');
    }

    // dto.subtotal is expected in cents
    const subtotalCents = dto.subtotal;
    let discountCents = 0;
    if (promo.discountType === DiscountType.PERCENTAGE) {
      discountCents = Math.round((subtotalCents * promo.discountValue) / 100);
    } else {
      discountCents = promo.discountValue;
    }
    const finalTotal = Math.max(0, subtotalCents - discountCents);

    return {
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount: discountCents,
      finalTotal,
    };
  }

  // ============================================================
  // Create Payment Intent
  // ============================================================
  async createPaymentIntent(userId: string, dto: CreatePaymentIntentDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true, variant: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
    });
    if (!address) throw new BadRequestException('Address not found');

    // Stock check and subtotal calculation (all in cents)
    let subtotalCents = 0;
    for (const item of cart.items) {
      const stock = item.variant?.stock ?? 0;
      if (stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${item.product.name}`,
        );
      }
      const price = item.variant?.price ?? item.product.price; // already in cents
      subtotalCents += price * item.quantity;
    }

    // Apply promo if provided
    let discountCents = 0;
    let promoCodeId: string | null = null;
    if (dto.promoCode) {
      const promo = await this.prisma.promoCode.findUnique({
        where: { code: dto.promoCode },
      });
      if (
        promo &&
        promo.isActive &&
        (!promo.expiresAt || promo.expiresAt >= new Date()) &&
        (!promo.usageLimit || promo.usageCount < promo.usageLimit)
      ) {
        promoCodeId = promo.id;
        if (promo.discountType === DiscountType.PERCENTAGE) {
          discountCents = Math.round(
            (subtotalCents * promo.discountValue) / 100,
          );
        } else {
          discountCents = promo.discountValue;
        }
      }
    }

    const totalCents = Math.max(0, subtotalCents - discountCents);
    const idempotencyKey = `cart_${cart.id}_${Date.now()}`;

    const paymentIntent = await this.stripe.paymentIntents.create(
      {
        amount: totalCents, // Stripe expects amount in cents
        currency: 'usd',
        metadata: {
          userId,
          addressId: dto.addressId,
          promoCodeId: promoCodeId ?? '',
        },
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      },
      { idempotencyKey },
    );

    return {
      clientSecret: paymentIntent.client_secret,
      amount: totalCents,
      currency: 'usd',
      breakdown: {
        subtotal: subtotalCents,
        discount: discountCents,
        total: totalCents,
      },
    };
  }

  // ============================================================
  // Stripe Webhook Handler
  // ============================================================
  async handleWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.configService.getOrThrow('STRIPE_WEBHOOK_SECRET'),
      );
    } catch (err) {
      this.logger.error('Webhook signature verification failed', err);
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      try {
        await this.createOrderFromPayment(paymentIntent);
        this.logger.log(`Order created for payment ${paymentIntent.id}`);
      } catch (error: unknown) {
        this.logger.error('createOrderFromPayment failed', error);
        throw new BadRequestException(
          'Order creation failed: ' + (error as Error).message ||
            'unknown error',
        );
      }
    }

    return { received: true };
  }

  // ============================================================
  // Create Order from Successful Payment (Core)
  // ============================================================
  private async createOrderFromPayment(paymentIntent: Stripe.PaymentIntent) {
    // Prevent duplicate orders
    const existing = await this.prisma.order.findUnique({
      where: { stripePaymentId: paymentIntent.id },
    });
    if (existing) return existing;

    const userId = paymentIntent.metadata.userId;
    const addressId = paymentIntent.metadata.addressId;
    const promoCodeId = paymentIntent.metadata.promoCodeId || null;

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true, variant: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      this.logger.warn(`No cart items for user ${userId}`);
      return;
    }

    // Calculate subtotal (already in cents)
    let subtotalCents = 0;
    for (const item of cart.items) {
      const price = item.variant?.price ?? item.product.price;
      subtotalCents += price * item.quantity;
    }

    // Recalculate discount if promoCodeId exists
    let discountCents = 0;
    let finalTotalCents = subtotalCents;
    if (promoCodeId) {
      const promo = await this.prisma.promoCode.findUnique({
        where: { id: promoCodeId },
      });
      if (
        promo &&
        promo.isActive &&
        (!promo.expiresAt || promo.expiresAt >= new Date()) &&
        (!promo.usageLimit || promo.usageCount < promo.usageLimit)
      ) {
        if (promo.discountType === DiscountType.PERCENTAGE) {
          discountCents = Math.round(
            (subtotalCents * promo.discountValue) / 100,
          );
        } else {
          discountCents = promo.discountValue;
        }
        finalTotalCents = Math.max(0, subtotalCents - discountCents);

        // Increment usage count
        await this.prisma.promoCode.update({
          where: { id: promoCodeId },
          data: { usageCount: { increment: 1 } },
        });
      }
    }

    // Process order within a transaction: create order, deduct stock, create logs, clear cart
    const order = await this.prisma.$transaction(async (tx) => {
      // Verify stock again and deduct
      for (const item of cart.items) {
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { stock: true },
          });
          if (!variant || variant.stock < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for ${item.product.name}`,
            );
          }
        }
      }

      const today = new Date();
      const datePart = `${today.getFullYear().toString().slice(-2)}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
      const prefix = `NU-${datePart}-`;

      const lastOrder: any[] = await tx.$queryRaw`
  SELECT "orderNumber" FROM "orders"
  WHERE "orderNumber" LIKE ${prefix + '%'} AND "orderNumber" IS NOT NULL
  ORDER BY "orderNumber" DESC LIMIT 1
`;
      let nextSequence = 1;
      if (lastOrder.length > 0 && lastOrder[0].orderNumber) {
        const parts = lastOrder[0].orderNumber.split('-');
        if (parts.length >= 3) {
          nextSequence = parseInt(parts[2]) + 1;
        }
      }
      const orderNumber = `${prefix}${nextSequence.toString().padStart(4, '0')}`;

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          promoCodeId,
          subtotal: subtotalCents,
          discount: discountCents,
          total: finalTotalCents,
          stripePaymentId: paymentIntent.id,
          stripeReceiptUrl: null, // will update later
          orderNumber,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: item.quantity,
              price: item.variant?.price ?? item.product.price,
            })),
          },
        },
      });

      // Deduct stock and create stock logs
      for (const item of cart.items) {
        if (item.variantId) {
          const variantBefore = await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
          await tx.stockLog.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              change: -item.quantity,
              reason: 'Order placed',
              stockBefore: variantBefore.stock + item.quantity,
              stockAfter: variantBefore.stock,
              orderId: newOrder.id,
            },
          });
        }
      }

      // Sync product totalStock
      const productIds = [...new Set(cart.items.map((item) => item.productId))];
      for (const pid of productIds) {
        const total = await tx.productVariant.aggregate({
          where: { productId: pid },
          _sum: { stock: true },
        });
        await tx.product.update({
          where: { id: pid },
          data: { totalStock: total._sum.stock ?? 0 },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    // Fetch receipt URL from Stripe (async, but not critical for response)
    try {
      const charge = await this.stripe.charges.retrieve(
        paymentIntent.latest_charge as string,
      );
      await this.prisma.order.update({
        where: { id: order.id },
        data: { stripeReceiptUrl: charge.receipt_url ?? null },
      });
    } catch (error) {
      this.logger.error('Failed to fetch receipt URL', error);
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });
      if (user) {
        const itemsForEmail = cart.items.map((item) => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: ((item.variant?.price ?? item.product.price) / 100).toFixed(2),
        }));
        await this.mailService.sendOrderConfirmationEmail(
          user.email,
          user.name,
          order.orderNumber!,
          itemsForEmail,
          order.total,
        );
      }
    } catch (err) {
      this.logger.error('Failed to send order confirmation email', err);
    }

    // Create in-app notification
    try {
      await this.prisma.notification.create({
        data: {
          userId,
          type: 'ORDER_PLACED',
          title: 'Order Placed',
          body: `Your order ${order.orderNumber} has been placed successfully.`,
        },
      });
    } catch (err) {
      this.logger.error('Failed to create notification', err);
    }

    return order;
  }

  // ============================================================
  // Manual Order Creation (fallback)
  // ============================================================
  async createOrder(userId: string, dto: CreateOrderDto) {
    // Prevent duplicate
    const existing = await this.prisma.order.findUnique({
      where: { stripePaymentId: dto.stripePaymentId },
    });
    if (existing) return existing;

    let paymentIntent: Stripe.PaymentIntent;
    try {
      paymentIntent = await this.stripe.paymentIntents.retrieve(
        dto.stripePaymentId,
      );
    } catch (error) {
      this.logger.error('Failed to retrieve payment intent', error);
      throw new BadRequestException(
        'Invalid payment ID or could not retrieve payment',
      );
    }

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not completed');
    }

    return this.createOrderFromPayment(paymentIntent);
  }

  // ============================================================
  // Get Orders (User)
  // ============================================================
  async getOrders(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: OrderStatus,
  ) {
    const where: any = { userId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  images: {
                    where: { isPrimary: true },
                    select: { url: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((order) => ({
        id: order.id,
        status: order.status,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        itemCount: order.items.length,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          productName: item.product.name,
          primaryImage: item.product.images[0]?.url ?? null,
          quantity: item.quantity,
          price: item.price,
        })),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================================
  // Get Order Detail
  // ============================================================
  async getOrderDetail(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        address: true,
        promoCode: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: {
                  where: { isPrimary: true },
                  select: { url: true },
                  take: 1,
                },
              },
            },
            review: true,
            variant: true,
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Not your order');

    return {
      id: order.id,
      status: order.status,
      subtotal: order.subtotal,
      discount: order.discount,
      total: order.total,
      stripeReceiptUrl: order.stripeReceiptUrl,
      createdAt: order.createdAt,
      address: order.address,
      promoCode: order.promoCode,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        primaryImage: item.product.images[0]?.url ?? null,
        variantName: item.variant?.name ?? null,
        variantValue: item.variant?.value ?? null,
        quantity: item.quantity,
        price: item.price,
        itemTotal: item.price * item.quantity,
        review: item.review,
      })),
    };
  }

  // ============================================================
  // Cancel Order
  // ============================================================
  async cancelOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Not your order');
    if (order.status !== OrderStatus.PENDING)
      throw new BadRequestException('Only pending orders can be cancelled');

    // Restore stock and log within transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      for (const item of order.items) {
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          });
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
          await tx.stockLog.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              change: item.quantity,
              reason: 'Order cancelled',
              stockBefore: variant!.stock,
              stockAfter: variant!.stock + item.quantity,
              orderId,
            },
          });
        }
      }

      // Sync product totalStock
      const productIds = [
        ...new Set(order.items.map((item) => item.productId)),
      ];
      for (const pid of productIds) {
        const total = await tx.productVariant.aggregate({
          where: { productId: pid },
          _sum: { stock: true },
        });
        await tx.product.update({
          where: { id: pid },
          data: { totalStock: total._sum.stock ?? 0 },
        });
      }
    });

    return { message: 'Order cancelled successfully' };
  }

  // ============================================================
  // Request Refund
  // ============================================================
  async requestRefund(userId: string, orderId: string, dto: RefundRequestDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        userId: true,
        orderNumber: true,
        status: true,
        deliveredAt: true,
        refundRequest: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Not your order');
    if (order.status !== OrderStatus.DELIVERED)
      throw new BadRequestException(
        'Only delivered orders are eligible for refund',
      );
    if (order.refundRequest)
      throw new BadRequestException('Refund already requested');
    const returnDays = 7; // or config
    if (order.deliveredAt) {
      const deadline = new Date(order.deliveredAt);
      deadline.setDate(deadline.getDate() + returnDays);
      if (new Date() > deadline) {
        throw new BadRequestException('Return window expired');
      }
    } else {
      throw new BadRequestException('Order not yet delivered');
    }
    const refund = await this.prisma.refundRequest.create({
      data: { orderId, reason: dto.reason },
      select: { id: true, status: true, reason: true, createdAt: true },
    });

    try {
      const admins = await this.prisma.user.findMany({
        where: { role: 'ADMIN', isActive: true },
        select: { id: true },
      });

      for (const admin of admins) {
        await this.prisma.notification.create({
          data: {
            userId: admin.id,
            // cast to any to satisfy NotificationType union
            type: 'REFUND_REQUESTED' as any,
            title: 'New Refund Request',
            body: `Order ${order.orderNumber ?? orderId} has a refund request. Reason: ${dto.reason}`,
          },
        });
      }
    } catch (err) {
      this.logger.error('Failed to notify admin about refund request', err);
    }

    return refund;
  }

  // ============================================================
  // Admin: Get All Orders
  // ============================================================
  async adminGetOrders(
    page: number = 1,
    limit: number = 20,
    status?: OrderStatus,
    search?: string,
  ) {
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.user = {
        OR: [{ name: { contains: search } }, { email: { contains: search } }],
      };
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { select: { id: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((order) => ({
        id: order.id,
        status: order.status,
        total: order.total,
        itemCount: order.items.length,
        customer: order.user,
        createdAt: order.createdAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================================
  // Admin: Update Order Status
  // ============================================================
  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      PROCESSING: [OrderStatus.SHIPPED],
      SHIPPED: [OrderStatus.DELIVERED],
      DELIVERED: [], // only via refund
      CANCELLED: [],
      REFUNDED: [],
    };

    if (!validTransitions[order.status].includes(dto.status)) {
      throw new BadRequestException('Invalid status transition');
    }

    if (
      dto.status === OrderStatus.SHIPPED ||
      dto.status === OrderStatus.DELIVERED
    ) {
      const user = await this.prisma.user.findUnique({
        where: { id: order.userId },
      });
      if (!user) throw new NotFoundException('User not found');

      await this.mailService.sendOrderStatusEmail(
        user.email,
        user.name,
        order.id, // or orderNumber
        dto.status,
        dto.trackingNumber,
      );
    }
    try {
      await this.prisma.notification.create({
        data: {
          userId: order.userId,
          type: 'ORDER_STATUS_UPDATE',
          title: `Order ${dto.status}`,
          body: `Your order ${order.id} status changed to ${dto.status}.`,
        },
      });
    } catch (err) {
      this.logger.error('Failed to create status notification', err);
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: dto.status,
        trackingNumber: dto.trackingNumber ?? undefined,
        deliveredAt:
          dto.status === OrderStatus.DELIVERED ? new Date() : undefined,
      },
      select: {
        id: true,
        status: true,
        trackingNumber: true,
        deliveredAt: true,
      },
    });

    return updated;
  }

  // ============================================================
  // Admin: Process Refund
  // ============================================================
  async processRefund(orderId: string, dto: ProcessRefundDto) {
    // Fetch order with items and refund request
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        refundRequest: true,
        items: {
          include: {
            variant: true, // variant needed to update stock
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (!order.refundRequest)
      throw new NotFoundException('Refund request not found');

    // If admin rejects
    if (dto.action === 'REJECT') {
      await this.prisma.refundRequest.update({
        where: { orderId },
        data: { status: 'REJECTED' },
      });
      return {
        refundId: order.refundRequest.id,
        status: 'REJECTED',
        stripeRefundId: null,
      };
    }

    // ========== APPROVE ==========
    if (!order.stripePaymentId) {
      throw new BadRequestException('No Stripe payment to refund');
    }

    // Execute restock (if requested) and refund inside a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Stock restock if requested
      if (dto.restock) {
        // Determine which items to restock (specific or all)
        const itemsToRestock = dto.restockItems?.length
          ? order.items.filter((item) => dto.restockItems!.includes(item.id))
          : order.items;

        for (const item of itemsToRestock) {
          if (item.variantId && item.variant) {
            // Fetch current stock to compute before/after
            const variantBefore = await tx.productVariant.findUnique({
              where: { id: item.variantId },
              select: { stock: true },
            });
            const updatedVariant = await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
            await tx.stockLog.create({
              data: {
                productId: item.productId,
                variantId: item.variantId,
                change: item.quantity,
                reason: 'Refund restock',
                stockBefore: variantBefore!.stock,
                stockAfter: updatedVariant.stock,
                orderId,
              },
            });
          }
        }

        // Sync product totalStock after restock
        const productIds = [
          ...new Set(itemsToRestock.map((item) => item.productId)),
        ];
        for (const pid of productIds) {
          const total = await tx.productVariant.aggregate({
            where: { productId: pid },
            _sum: { stock: true },
          });
          await tx.product.update({
            where: { id: pid },
            data: { totalStock: total._sum.stock ?? 0 },
          });
        }
      }

      // 2. Process Stripe refund
      const refund = await this.stripe.refunds.create({
        payment_intent: order.stripePaymentId!,
      });

      // 3. Update refund request and order status
      await tx.refundRequest.update({
        where: { orderId },
        data: { status: 'APPROVED', stripeRefundId: refund.id },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.REFUNDED },
      });

      return {
        refundId: order.refundRequest!.id,
        status: 'APPROVED',
        stripeRefundId: refund.id,
      };
    });

    return result;
  }

  // ============================================================
  // Cron Job: Cancel Expired Pending Orders
  // ============================================================
  async cancelExpiredPendingOrders() {
    const expirationMinutes = 30;
    const cutoff = new Date(Date.now() - expirationMinutes * 60 * 1000);
    const expiredOrders = await this.prisma.order.findMany({
      where: { status: OrderStatus.PENDING, createdAt: { lt: cutoff } },
      include: { items: true },
    });

    for (const order of expiredOrders) {
      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CANCELLED },
        });
        // Restore stock
        for (const item of order.items) {
          if (item.variantId) {
            const variant = await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
            await tx.stockLog.create({
              data: {
                productId: item.productId,
                variantId: item.variantId,
                change: item.quantity,
                reason: 'Order expired',
                stockBefore: variant.stock - item.quantity,
                stockAfter: variant.stock,
                orderId: order.id,
              },
            });
          }
        }

        // Sync product totalStock
        const productIds = [
          ...new Set(order.items.map((item) => item.productId)),
        ];
        for (const pid of productIds) {
          const total = await tx.productVariant.aggregate({
            where: { productId: pid },
            _sum: { stock: true },
          });
          await tx.product.update({
            where: { id: pid },
            data: { totalStock: total._sum.stock ?? 0 },
          });
        }
      });
    }
  }

  async generateInvoice(userId: string, orderId: string): Promise<Buffer> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true, variant: true } },
        address: true,
        promoCode: true,
      },
    });

    if (!order || order.userId !== userId) {
      throw new ForbiddenException('Not your order');
    }

    return this.invoiceService.generateInvoice(order);
  }

async getAdminOrderDetail(orderId: string) {
  const order = await this.prisma.order.findUnique({
    where: { id: orderId },
    include: {
      address: true,
      promoCode: true,
      refundRequest: true,
      items: {
        include: {
          product: {
            select: {
              name: true,
              images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
            },
          },
          variant: true,
          review: true,
        },
      },
    },
  });

  if (!order) throw new NotFoundException('Order not found');

  return {
    id: order.id,
    status: order.status,
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    stripeReceiptUrl: order.stripeReceiptUrl,
    orderNumber: order.orderNumber,
    refundRequest: order.refundRequest,
    createdAt: order.createdAt,
    address: order.address,
    promoCode: order.promoCode,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      primaryImage: item.product.images[0]?.url ?? null,
      variantName: item.variant?.name ?? null,
      variantValue: item.variant?.value ?? null,
      quantity: item.quantity,
      price: item.price,
      itemTotal: item.price * item.quantity,
    })),
  };
}
}
