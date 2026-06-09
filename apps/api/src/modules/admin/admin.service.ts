import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // Dashboard Overview
  // ============================================================

  async getOverview() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalRevenueThis,
      totalRevenueLast,
      totalOrdersThis,
      totalOrdersLast,
      totalUsers,
      totalUsersLast,
      productGroups,
      pendingOrders,
      refundRequests,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: { createdAt: { gte: thisMonth }, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: lastMonth, lt: thisMonth },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: thisMonth } },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: lastMonth, lt: thisMonth } },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { createdAt: { lt: thisMonth } },
      }),
      this.prisma.product.groupBy({
        by: ['isActive'],
        where: { isDeleted: false },
        _count: true,
      }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.refundRequest.count({ where: { status: 'PENDING' } }),
    ]);

    const revenueThis = totalRevenueThis._sum.total ?? 0;
    const revenueLast = totalRevenueLast._sum.total ?? 0;
    const revenueChange =
      revenueLast > 0 ? ((revenueThis - revenueLast) / revenueLast) * 100 : 0;

    const ordersChange =
      totalOrdersLast > 0
        ? ((totalOrdersThis - totalOrdersLast) / totalOrdersLast) * 100
        : 0;

    const usersChange =
      totalUsersLast > 0
        ? ((totalUsers - totalUsersLast) / totalUsersLast) * 100
        : 0;

    const activeProducts = productGroups.find((g) => g.isActive)?._count ?? 0;
    const inactiveProducts =
      productGroups.find((g) => !g.isActive)?._count ?? 0;
    const totalProducts = activeProducts + inactiveProducts;

    return {
      totalRevenue: {
        value: revenueThis,
        changePercent: Math.round(revenueChange * 10) / 10,
        period: 'vs last month',
      },
      totalOrders: {
        value: totalOrdersThis,
        changePercent: Math.round(ordersChange * 10) / 10,
        period: 'vs last month',
      },
      totalUsers: {
        value: totalUsers,
        changePercent: Math.round(usersChange * 10) / 10,
        period: 'vs last month',
      },
      totalProducts: {
        value: totalProducts,
        active: activeProducts,
        inactive: inactiveProducts,
      },
      pendingOrders,
      refundRequests,
    };
  }

  // ============================================================
  // Revenue Chart
  // ============================================================

  async getRevenue(period: string = 'monthly') {
    const now = new Date();
    let chart: { label: string; revenue: number; orders: number }[] = [];

    if (period === 'monthly') {
      const labels = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const promises: Promise<{
        label: string;
        revenue: number;
        orders: number;
      }>[] = [];

      for (let month = 0; month <= now.getMonth(); month++) {
        const start = new Date(now.getFullYear(), month, 1);
        const end = new Date(now.getFullYear(), month + 1, 1);

        promises.push(
          (async () => {
            const [revenueResult, ordersCount] = await Promise.all([
              this.prisma.order.aggregate({
                where: {
                  createdAt: { gte: start, lt: end },
                  status: { not: 'CANCELLED' },
                },
                _sum: { total: true },
              }),
              this.prisma.order.count({
                where: { createdAt: { gte: start, lt: end } },
              }),
            ]);
            return {
              label: labels[month],
              revenue: revenueResult._sum.total ?? 0,
              orders: ordersCount,
            };
          })(),
        );
      }

      chart = await Promise.all(promises);
    } else if (period === 'weekly') {
      // Generate labels for the last 7 days
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const promises: Promise<{
        label: string;
        revenue: number;
        orders: number;
      }>[] = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const start = new Date(date.setHours(0, 0, 0, 0));
        const end = new Date(date.setHours(23, 59, 59, 999));

        promises.push(
          (async () => {
            const [revenueResult, ordersCount] = await Promise.all([
              this.prisma.order.aggregate({
                where: {
                  createdAt: { gte: start, lte: end },
                  status: { not: 'CANCELLED' },
                },
                _sum: { total: true },
              }),
              this.prisma.order.count({
                where: { createdAt: { gte: start, lte: end } },
              }),
            ]);
            return {
              label: dayNames[start.getDay()],
              revenue: revenueResult._sum.total ?? 0,
              orders: ordersCount,
            };
          })(),
        );
      }

      chart = await Promise.all(promises);
    }

    const totals = chart.reduce(
      (acc, item) => ({
        revenue: acc.revenue + item.revenue,
        orders: acc.orders + item.orders,
      }),
      { revenue: 0, orders: 0 },
    );

    return { period, chart, totals };
  }

  // ============================================================
  // Recent Orders
  // ============================================================

  async getRecentOrders(limit: number = 10) {
    return this.prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        user: {
          select: { name: true, email: true, avatar: true },
        },
      },
    });
  }

  // ============================================================
  // Low Stock
  // ============================================================

  async getLowStock(
    threshold: number = 10,
    page: number = 1,
    limit: number = 20,
  ) {
    const variants = await this.prisma.productVariant.findMany({
      where: { stock: { lte: threshold } },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: {
              where: { isPrimary: true },
              select: { url: true },
              take: 1,
            },
          },
        },
      },
    });

    const productMap = new Map<string, any>();
    for (const variant of variants) {
      if (!productMap.has(variant.product.id)) {
        productMap.set(variant.product.id, {
          id: variant.product.id,
          name: variant.product.name,
          slug: variant.product.slug,
          primaryImage: variant.product.images[0]?.url ?? null,
          variants: [],
          totalStock: 0,
        });
      }
      const product = productMap.get(variant.product.id);
      product.variants.push({
        id: variant.id,
        name: variant.name,
        value: variant.value,
        stock: variant.stock,
      });
      product.totalStock += variant.stock;
    }

    const products = Array.from(productMap.values());
    const total = products.length;
    const paginated = products.slice((page - 1) * limit, page * limit);

    return {
      products: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================================
  // Best Sellers
  // ============================================================

  async getBestSellers(limit: number = 10, period: string = '30d') {
    const now = new Date();
    let startDate: Date | undefined;

    if (period === '30d')
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (period === '90d')
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Aggregate quantity sold per product
    const orderItems = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: startDate
        ? { order: { createdAt: { gte: startDate } } }
        : undefined,
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const productIds = orderItems.map((item) => item.productId);

    // Batch fetch product details
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        avgRating: true,
        images: {
          where: { isPrimary: true },
          select: { url: true },
          take: 1,
        },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return orderItems.map((item) => {
      const product = productMap.get(item.productId);
      const quantity = item._sum.quantity ?? 0;
      return {
        id: product?.id,
        name: product?.name,
        slug: product?.slug,
        price: product?.price,
        primaryImage: product?.images[0]?.url ?? null,
        totalSold: quantity,
        revenue: quantity * (product?.price ?? 0),
        avgRating: product?.avgRating ?? 0,
      };
    });
  }

  // ============================================================
  // Get All Users (Admin)
  // ============================================================

  async getUsers(
    page: number = 1,
    limit: number = 20,
    search?: string,
    isActive?: boolean,
  ) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (isActive !== undefined) where.isActive = isActive;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Batch aggregate order stats for these users
    const userIds = users.map((u) => u.id);
    const orderStats = await this.prisma.order.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _sum: { total: true },
      _count: true,
    });
    const statsMap = new Map(
      orderStats.map((stat) => [
        stat.userId,
        { totalSpent: stat._sum.total ?? 0, totalOrders: stat._count },
      ]),
    );

    return {
      users: users.map((user) => {
        const stats = statsMap.get(user.id) || {
          totalSpent: 0,
          totalOrders: 0,
        };
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          totalOrders: stats.totalOrders,
          totalSpent: stats.totalSpent,
          createdAt: user.createdAt,
        };
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  // ============================================================
  // Get User Detail (Admin)
  // ============================================================

  async getUserDetail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) throw new Error('User not found');

    const totalSpent = user.orders.reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = user.orders.filter(
      (o) => o.status === 'PENDING',
    ).length;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      stats: {
        totalOrders: user.orders.length,
        totalSpent,
        pendingOrders,
      },
      recentOrders: user.orders,
    };
  }

  // ============================================================
  // Update User Status (Admin)
  // ============================================================

  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new Error('User not found');
    if (user.role === 'ADMIN') {
      throw new Error('Cannot deactivate admin account');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, isActive: true },
    });

    return updated;
  }
}
