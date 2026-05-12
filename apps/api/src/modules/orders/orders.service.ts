import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, DiscountType } from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RefundRequestDto } from './dto/refund-request.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';

@Injectable()
export class OrdersService {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow('STRIPE_SECRET_KEY'),
    );
  }

  // ============================================================
  // Validate Promo Helper
  // ============================================================

  private async calculateDiscount(
    promoCode: string | undefined,
    subtotal: number,
  ) {
    if (!promoCode) return { promoCodeId: null, discount: 0 };

    const promo = await this.prisma.promoCode.findUnique({
      where: { code: promoCode },
    });

    if (!promo || !promo.isActive) return { promoCodeId: null, discount: 0 };
    if (promo.expiresAt && promo.expiresAt < new Date())
      return { promoCodeId: null, discount: 0 };
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit)
      return { promoCodeId: null, discount: 0 };

    const discount =
      promo.discountType === DiscountType.PERCENTAGE
        ? (subtotal * promo.discountValue) / 100
        : promo.discountValue;

    return { promoCodeId: promo.id, discount };
  }

  // ============================================================
  // Create Payment Intent
  // ============================================================

  async createPaymentIntent(userId: string, dto: CreatePaymentIntentDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
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

    // Stock check
    for (const item of cart.items) {
      const stock = item.variant?.stock ?? 0;
      if (stock < item.quantity) {
        throw new BadRequestException('Some items are out of stock');
      }
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.variant?.price ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);

    const { discount } = await this.calculateDiscount(dto.promoCode, subtotal);
    const total = Math.max(0, subtotal - discount);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      metadata: { userId, addressId: dto.addressId },
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      amount: total,
      currency: 'usd',
      breakdown: { subtotal, discount, total },
    };
  }

  // ============================================================
  // Stripe Webhook
  // ============================================================

  async handleWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.configService.getOrThrow('STRIPE_WEBHOOK_SECRET'),
      );
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await this.createOrderFromPayment(paymentIntent);
    }

    return { received: true };
  }

  // ============================================================
  // Create Order (from webhook or manual)
  // ============================================================

  private async createOrderFromPayment(paymentIntent: Stripe.PaymentIntent) {
    const existing = await this.prisma.order.findUnique({
      where: { stripePaymentId: paymentIntent.id },
    });

    if (existing) return existing;

    const userId = paymentIntent.metadata.userId;
    const addressId = paymentIntent.metadata.addressId;

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true, variant: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) return;

    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.variant?.price ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);

    const order = await this.prisma.order.create({
      data: {
        userId,
        addressId,
        subtotal,
        discount: 0,
        total: subtotal,
        stripePaymentId: paymentIntent.id,
        stripeReceiptUrl: paymentIntent.latest_charge as string,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant?.price ?? item.product.price,
          })),
        },
      },
    });

    // Cart clear করো
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    // Stock update করো
    for (const item of cart.items) {
      if (item.variantId) {
        await this.prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    return order;
  }

  async createOrder(userId: string, dto: CreateOrderDto) {
    const existing = await this.prisma.order.findUnique({
      where: { stripePaymentId: dto.stripePaymentId },
    });

    if (existing) return existing;

    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      dto.stripePaymentId,
    );

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not completed');
    }

    return this.createOrderFromPayment(paymentIntent);
  }

  // ============================================================
  // Get Orders
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
      })),
    };
  }

  // ============================================================
  // Cancel Order
  // ============================================================

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Not your order');
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    });

    return { message: 'Order cancelled successfully' };
  }

  // ============================================================
  // Request Refund
  // ============================================================

  async requestRefund(userId: string, orderId: string, dto: RefundRequestDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { refundRequest: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new ForbiddenException('Not your order');
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'Only delivered orders are eligible for refund',
      );
    }
    if (order.refundRequest) {
      throw new BadRequestException('Refund already requested');
    }

    const refund = await this.prisma.refundRequest.create({
      data: { orderId, reason: dto.reason },
      select: {
        id: true,
        status: true,
        reason: true,
        createdAt: true,
      },
    });

    return refund;
  }

  // ============================================================
  // Admin — Get All Orders
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
          user: {
            select: { id: true, name: true, email: true },
          },
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
  // Admin — Update Order Status
  // ============================================================

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');

    // Valid transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      PROCESSING: [OrderStatus.SHIPPED],
      SHIPPED: [OrderStatus.DELIVERED],
      DELIVERED: [OrderStatus.REFUNDED],
      CANCELLED: [],
      REFUNDED: [],
    };

    if (!validTransitions[order.status].includes(dto.status)) {
      throw new BadRequestException('Invalid status transition');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: dto.status,
        ...(dto.trackingNumber && { trackingNumber: dto.trackingNumber }),
      },
      select: {
        id: true,
        status: true,
        trackingNumber: true,
      },
    });

    return updated;
  }

  // ============================================================
  // Admin — Process Refund
  // ============================================================

  async processRefund(orderId: string, dto: ProcessRefundDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { refundRequest: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (!order.refundRequest)
      throw new NotFoundException('Refund request not found');

    if (dto.action === 'APPROVE' && order.stripePaymentId) {
      const refund = await this.stripe.refunds.create({
        payment_intent: order.stripePaymentId,
      });

      await this.prisma.refundRequest.update({
        where: { orderId },
        data: { status: 'APPROVED' },
      });

      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.REFUNDED },
      });

      return {
        refundId: order.refundRequest.id,
        status: 'APPROVED',
        stripeRefundId: refund.id,
      };
    }

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
}
