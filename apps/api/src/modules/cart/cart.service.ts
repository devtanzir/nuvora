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
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                isActive: true,
                isDeleted: false,
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

    // Stock check
    if (dto.variantId) {
      const variant = await this.prisma.productVariant.findFirst({
        where: { id: dto.variantId, productId: dto.productId },
      });

      if (!variant) throw new NotFoundException('Variant not found');
      if (variant.stock === 0) throw new BadRequestException('Product is out of stock');
      if (variant.stock < dto.quantity) {
        throw new BadRequestException(`Insufficient stock. Available: ${variant.stock}`);
      }
    }

    const cart = await this.getOrCreateCart(userId);

    // Already in cart check
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId ?? null,
      },
    });

    if (existingItem) {
      const updated = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
      });

      const price = product.price;
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
        variantId: dto.variantId,
        quantity: dto.quantity,
      },
    });

    return {
      id: item.id,
      quantity: item.quantity,
      itemTotal: product.price * item.quantity,
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
