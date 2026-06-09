import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // Get or Create Cart
  // ============================================================

  private async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    return cart;
  }

  // ============================================================
  // Get Cart
  // ============================================================

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          where: {
            product: {
              isDeleted: false,
              isActive: true,
            },
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                isActive: true,
                images: {
                  where: { isPrimary: true },
                  select: { url: true },
                  take: 1,
                },
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                value: true,
                stock: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return {
        id: null,
        items: [],
        subtotal: 0,
        itemCount: 0,
      };
    }

    const items = cart.items.map((item) => {
      const price = item.variant?.price ?? item.product.price;
      return {
        id: item.id,
        quantity: item.quantity,
        product: {
          ...item.product,
          primaryImage: item.product.images[0]?.url ?? null,
        },
        variant: item.variant,
        itemTotal: price * item.quantity,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      items,
      subtotal,
      itemCount,
    };
  }

  // ============================================================
  // Add Item to Cart
  // ============================================================

  async addItem(userId: string, dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId, isDeleted: false, isActive: true },
    });

    if (!product) throw new NotFoundException('Product not found');
    const variantCount = await this.prisma.productVariant.count({
      where: { productId: dto.productId, id: { not: 'default' } },
    });

    if (variantCount > 0 && !dto.variantId) {
      throw new BadRequestException('Variant selection is required');
    }
    // Determine variantId: use provided or sentinel
    const variantId = dto.variantId ?? 'default';

    // Stock check
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId: dto.productId },
    });

    if (!variant) throw new NotFoundException('Variant not found');
    if (variant.stock === 0)
      throw new BadRequestException('Product is out of stock');
    if (variant.stock < dto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${variant.stock}`,
      );
    }

    const cart = await this.getOrCreateCart(userId);

    // Already in cart?
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: dto.productId,
        variantId, // not null anymore
      },
    });

    if (existingItem) {
      const updated = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
      });

      const price = variant.price ?? product.price; // cents
      return {
        id: updated.id,
        quantity: updated.quantity,
        itemTotal: price * updated.quantity,
      };
    }

    const item = await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        variantId, // always string
        quantity: dto.quantity,
      },
    });

    const price = variant.price ?? product.price;
    return {
      id: item.id,
      quantity: item.quantity,
      itemTotal: price * item.quantity,
    };
  }

  // ============================================================
  // Update Item Quantity
  // ============================================================

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart item not found');

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: {
        product: true,
        variant: true,
      },
    });

    if (!item) throw new NotFoundException('Cart item not found');

    const stock = item.variant?.stock ?? 999;
    if (dto.quantity > stock) {
      throw new BadRequestException(`Insufficient stock. Available: ${stock}`);
    }

    const updated = await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    });

    const price = item.variant?.price ?? item.product.price;

    return {
      id: updated.id,
      quantity: updated.quantity,
      itemTotal: price * updated.quantity,
    };
  }

  // ============================================================
  // Remove Item
  // ============================================================

  async removeItem(userId: string, itemId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundException('Cart item not found');

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    return { message: 'Item removed from cart' };
  }

  // ============================================================
  // Clear Cart
  // ============================================================

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });

    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return { message: 'Cart cleared' };
  }
}
