import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { MoveToCartDto } from './dto/move-to-cart.dto';
import { CartService } from '../cart/cart.service';

@Injectable()
export class WishlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
  ) {}

  // ============================================================
  // Get Wishlist
  // ============================================================

  async getWishlist(userId: string, page: number = 1, limit: number = 20) {
    const [items, total] = await Promise.all([
      this.prisma.wishlist.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              originalPrice: true,
              isActive: true,
              images: {
                where: { isPrimary: true },
                select: { url: true },
                take: 1,
              },
              variants: {
                select: { stock: true },
              },
              reviews: {
                select: { rating: true },
              },
            },
          },
        },
      }),
      this.prisma.wishlist.count({ where: { userId } }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        createdAt: item.createdAt,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: item.product.price,
          originalPrice: item.product.originalPrice,
          isActive: item.product.isActive,
          primaryImage: item.product.images[0]?.url ?? null,
          stock: item.product.variants.reduce((sum, v) => sum + v.stock, 0),
          avgRating:
            item.product.reviews.length > 0
              ? item.product.reviews.reduce((sum, r) => sum + r.rating, 0) /
                item.product.reviews.length
              : 0,
        },
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
  // Add to Wishlist
  // ============================================================

  async addToWishlist(userId: string, dto: AddToWishlistDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId, isDeleted: false },
    });

    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId: dto.productId } },
    });

    if (existing) throw new BadRequestException('Product already in wishlist');

    const item = await this.prisma.wishlist.create({
      data: { userId, productId: dto.productId },
      select: { id: true, productId: true },
    });

    return item;
  }

  // ============================================================
  // Remove from Wishlist
  // ============================================================

  async removeFromWishlist(userId: string, productId: string) {
    const item = await this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (!item) throw new NotFoundException('Product not found in wishlist');

    await this.prisma.wishlist.delete({
      where: { userId_productId: { userId, productId } },
    });

    return { message: 'Product removed from wishlist' };
  }

  // ============================================================
  // Move to Cart
  // ============================================================

  async moveToCart(userId: string, productId: string, dto: MoveToCartDto) {
    const item = await this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (!item) throw new NotFoundException('Product not found in wishlist');

    const cartItem = await this.cartService.addItem(userId, {
      productId,
      variantId: dto.variantId,
      quantity: dto.quantity ?? 1,
    });

    await this.prisma.wishlist.delete({
      where: { userId_productId: { userId, productId } },
    });

    return { cartItemId: cartItem.id };
  }
}
