import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // Helper: Update product totalStock from variant aggregates
  // ============================================================
  private async updateProductTotalStock(productId: string) {
    const aggregate = await this.prisma.productVariant.aggregate({
      where: { productId },
      _sum: { stock: true },
    });
    await this.prisma.product.update({
      where: { id: productId },
      data: { totalStock: aggregate._sum.stock ?? 0 },
    });
  }

  // ============================================================
  // Get All Products
  // ============================================================
  async findAll(query: ProductQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      categorySlug,
      minPrice,
      maxPrice,
      inStock,
      sortBy,
      rating,
    } = query;

    const where: any = {
      isActive: true,
      isDeleted: false,
    };

    if (search) {
      where.name = { contains: search };
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (rating) {
      where.avgRating = { gte: rating };
    }

    if (inStock) {
      where.variants = { some: { stock: { gt: 0 } } };
    }

    const orderBy: any = {};
    switch (sortBy) {
      case 'price_asc':
        orderBy.price = 'asc';
        break;
      case 'price_desc':
        orderBy.price = 'desc';
        break;
      case 'newest':
        orderBy.createdAt = 'desc';
        break;
      case 'rating':
        orderBy.avgRating = 'desc';
        break;
      case 'most_reviewed':
        orderBy.reviewCount = 'desc';
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          originalPrice: true,
          isActive: true,
          avgRating: true,
          reviewCount: true,
          totalStock: true,
          category: { select: { id: true, name: true, slug: true } },
          images: {
            where: { isPrimary: true },
            select: { url: true },
            take: 1,
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const productsData = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      originalPrice: p.originalPrice,
      avgRating: p.avgRating ?? 0,
      reviewCount: p.reviewCount,
      stock: p.totalStock ?? 0,
      isActive: p.isActive,
      category: p.category,
      primaryImage: p.images[0]?.url ?? null,
    }));

    return {
      products: productsData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ============================================================
  // Get Single Product
  // ============================================================
  async findOne(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, isDeleted: false },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { order: 'asc' } },
        variants: true,
        reviews: { select: { rating: true } },
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    const relatedProducts = await this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        isDeleted: false,
        id: { not: product.id },
      },
      take: 4,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
      },
    });

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      avgRating:
        product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
            product.reviews.length
          : 0,
      reviewCount: product.reviews.length,
      isActive: product.isActive,
      category: product.category,
      images: product.images,
      variants: product.variants,
      relatedProducts: relatedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        primaryImage: p.images[0]?.url ?? null,
      })),
    };
  }

  // ============================================================
  // Get All Products (Admin)
  // ============================================================
  async adminFindAll(query: ProductQueryDto) {
    const { page = 1, limit = 20, search, categorySlug } = query;

    const where: any = { isDeleted: false };
    if (search) where.name = { contains: search };
    if (categorySlug) where.category = { slug: categorySlug };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          originalPrice: true,
          isActive: true,
          avgRating: true,
          reviewCount: true,
          totalStock: true,
          category: { select: { id: true, name: true, slug: true } },
          images: {
            where: { isPrimary: true },
            select: { url: true },
            take: 1,
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        originalPrice: p.originalPrice,
        isActive: p.isActive,
        avgRating: p.avgRating ?? 0,
        reviewCount: p.reviewCount,
        stock: p.totalStock ?? 0,
        category: p.category,
        primaryImage: p.images[0]?.url ?? null,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ============================================================
  // Create Product
  // ============================================================
  async create(dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) throw new BadRequestException('Category not found');
    if (!dto.images || dto.images.length === 0)
      throw new BadRequestException('At least one image required');

    let baseSlug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let count = 0;
    while (await this.prisma.product.findUnique({ where: { slug } })) {
      count++;
      slug = `${baseSlug}-${count}`;
    }

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        price: dto.price,
        originalPrice: dto.originalPrice,
        categoryId: dto.categoryId,
        images: { create: dto.images },
        variants:
          dto.variants && dto.variants.length > 0
            ? { create: dto.variants }
            : {
                create: {
                  name: 'default',
                  value: 'default',
                  stock: 0,
                  price: null,
                },
              },
      },
      select: { id: true, name: true, slug: true },
    });

    // Sync denormalized stock
    await this.updateProductTotalStock(product.id);

    return product;
  }

  // ============================================================
  // Update Product
  // ============================================================
  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id, isDeleted: false },
    });
    if (!product) throw new NotFoundException('Product not found');

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.originalPrice !== undefined && {
          originalPrice: dto.originalPrice,
        }),
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: { id: true, price: true, isActive: true },
    });

    return updated;
  }

  // ============================================================
  // Delete Product (Soft Delete)
  // ============================================================
  async delete(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id, isDeleted: false },
    });
    if (!product) throw new NotFoundException('Product not found');

    await this.prisma.product.update({
      where: { id },
      data: { isDeleted: true, isActive: false },
    });
    return { message: 'Product deleted successfully' };
  }

  // ============================================================
  // Get Variants
  // ============================================================
  async getVariants(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isDeleted: false },
    });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.productVariant.findMany({ where: { productId } });
  }

  // ============================================================
  // Add Variant
  // ============================================================
  async addVariant(productId: string, dto: CreateVariantDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isDeleted: false },
    });
    if (!product) throw new NotFoundException('Product not found');

    const created = await this.prisma.productVariant.create({
      data: { productId, ...dto },
      select: { id: true, name: true, value: true, stock: true },
    });

    // Sync after creation
    await this.updateProductTotalStock(productId);

    return created;
  }

  // ============================================================
  // Update Variant
  // ============================================================
  async updateVariant(
    productId: string,
    variantId: string,
    dto: UpdateVariantDto,
  ) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });
    if (!variant) throw new NotFoundException('Variant not found');

    const updated = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: dto,
      select: { id: true, stock: true, price: true },
    });

    // Sync after update
    await this.updateProductTotalStock(productId);

    return updated;
  }

  // ============================================================
  // Delete Variant
  // ============================================================
  async deleteVariant(productId: string, variantId: string) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
    });
    if (!variant) throw new NotFoundException('Variant not found');

    const cartItems = await this.prisma.cartItem.count({
      where: { variantId },
    });
    if (cartItems > 0)
      throw new BadRequestException(
        'Cannot delete variant with active cart items',
      );

    await this.prisma.productVariant.delete({ where: { id: variantId } });

    // Sync after deletion
    await this.updateProductTotalStock(productId);

    return { message: 'Variant deleted successfully' };
  }

  // ============================================================
  // Get Stock Logs
  // ============================================================
  async getStockLogs(productId: string, page: number = 1, limit: number = 20) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const [logs, total] = await Promise.all([
      this.prisma.stockLog.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.stockLog.count({ where: { productId } }),
    ]);

    return {
      logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
