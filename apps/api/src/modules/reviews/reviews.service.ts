import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  private async updateProductRating(productId: string) {
    const stats = await this.prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const avg = stats._avg.rating ?? 0;
    const count = stats._count.rating;

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        avgRating: Math.round(avg * 10) / 10,
        reviewCount: count,
      },
    });
  }

  // ============================================================
  // Get Reviews Summary
  // ============================================================

  async getSummary(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isDeleted: false },
    });

    if (!product) throw new NotFoundException('Product not found');

    const reviews = await this.prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      distribution[r.rating as keyof typeof distribution]++;
    });

    return {
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews,
      distribution,
    };
  }

  // ============================================================
  // Get Reviews
  // ============================================================

  async getReviews(
    productId: string,
    page: number = 1,
    limit: number = 10,
    sort: string = 'newest',
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isDeleted: false },
    });

    if (!product) throw new NotFoundException('Product not found');

    const orderBy: any =
      sort === 'highest'
        ? { rating: 'desc' }
        : sort === 'lowest'
          ? { rating: 'asc' }
          : { createdAt: 'desc' };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where: { productId } }),
    ]);

    return {
      reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================================
  // Create Review
  // ============================================================

  async createReview(userId: string, productId: string, dto: CreateReviewDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isDeleted: false },
    });

    if (!product) throw new NotFoundException('Product not found');

    // Purchase verification: user must have a delivered order with this product to review
    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          id: dto.orderId,
          status: 'DELIVERED',
        },
      },
    });

    if (!orderItem) {
      throw new BadRequestException('You have not purchased this product');
    }

    // Already reviewed check
    const existingReview = await this.prisma.review.findUnique({
      where: { orderItemId: orderItem.id },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    const review = await this.prisma.review.create({
      data: {
        userId,
        productId,
        orderItemId: orderItem.id,
        rating: dto.rating,
        title: dto.title,
        body: dto.body,
      },
      select: {
        id: true,
        rating: true,
        title: true,
        createdAt: true,
      },
    });
    await this.updateProductRating(productId);
    return review;
  }

  // ============================================================
  // Update Review
  // ============================================================

  async updateReview(
    userId: string,
    productId: string,
    reviewId: string,
    dto: UpdateReviewDto,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) throw new NotFoundException('Review not found');
    if (review.productId !== productId)
      throw new NotFoundException('Review not found');
    if (review.userId !== userId)
      throw new ForbiddenException('Not your review');

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: dto,
      select: {
        id: true,
        rating: true,
        title: true,
        updatedAt: true,
      },
    });
    await this.updateProductRating(productId);

    return updated;
  }

  // ============================================================
  // Delete Review
  // ============================================================

  async deleteReview(userId: string, productId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) throw new NotFoundException('Review not found');
    if (review.productId !== productId)
      throw new NotFoundException('Review not found');
    if (review.userId !== userId)
      throw new ForbiddenException('Not your review');

    await this.prisma.review.delete({ where: { id: reviewId } });
    await this.updateProductRating(productId);

    return { message: 'Review deleted successfully' };
  }
}
