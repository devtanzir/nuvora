'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { adminService } from '@/services/admin.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { formatPrice, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  PENDING:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PROCESSING:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SHIPPED:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERED:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  REFUNDED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

export function DashboardContent() {
  const { data: overview, isLoading: isLoadingOverview } = useQuery({
    queryKey: QUERY_KEYS.ADMIN_OVERVIEW,
    queryFn: adminService.getOverview,
  });

  const { data: revenue, isLoading: isLoadingRevenue } = useQuery({
    queryKey: QUERY_KEYS.ADMIN_REVENUE('monthly'),
    queryFn: () => adminService.getRevenue('monthly'),
  });

  const { data: recentOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['admin', 'recent-orders'],
    queryFn: () => adminService.getRecentOrders(5),
  });

  const { data: lowStock, isLoading: isLoadingLowStock } = useQuery({
    queryKey: QUERY_KEYS.ADMIN_LOW_STOCK,
    queryFn: () => adminService.getLowStock(10),
  });

  const statCards = overview
    ? [
        {
          label: 'Total Revenue',
          value: formatPrice(overview.totalRevenue.value),
          change: overview.totalRevenue.changePercent,
          period: overview.totalRevenue.period,
          icon: DollarSign,
          color: 'text-green-600',
          bg: 'bg-green-100 dark:bg-green-900/30',
        },
        {
          label: 'Total Orders',
          value: overview.totalOrders.value.toString(),
          change: overview.totalOrders.changePercent,
          period: overview.totalOrders.period,
          icon: ShoppingCart,
          color: 'text-blue-600',
          bg: 'bg-blue-100 dark:bg-blue-900/30',
        },
        {
          label: 'Total Users',
          value: overview.totalUsers.value.toString(),
          change: overview.totalUsers.changePercent,
          period: overview.totalUsers.period,
          icon: Users,
          color: 'text-purple-600',
          bg: 'bg-purple-100 dark:bg-purple-900/30',
        },
        {
          label: 'Total Products',
          value: overview.totalProducts.value.toString(),
          change: null,
          period: `${overview.totalProducts.active} active`,
          icon: Package,
          color: 'text-gold',
          bg: 'bg-gold/10',
        },
      ]
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-playfair font-bold text-navy dark:text-white">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back! Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingOverview
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))
          : statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="p-5 rounded-xl border border-border bg-card space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {card.label}
                    </p>
                    <div className={cn('p-2 rounded-lg', card.bg)}>
                      <Icon className={cn('h-4 w-4', card.color)} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-navy dark:text-white">
                    {card.value}
                  </p>
                  <div className="flex items-center gap-1 text-xs">
                    {card.change !== null ? (
                      <>
                        {card.change >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-destructive" />
                        )}
                        <span
                          className={
                            card.change >= 0
                              ? 'text-green-600'
                              : 'text-destructive'
                          }
                        >
                          {Math.abs(card.change)}%
                        </span>
                      </>
                    ) : null}
                    <span className="text-muted-foreground">{card.period}</span>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Revenue Chart */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-playfair font-bold text-navy dark:text-white">
            Revenue Overview
          </h2>
        </div>
        {isLoadingRevenue ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : revenue && revenue.chart.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenue.chart}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value) => [formatPrice(value as number), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#C9A84C"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">No revenue data available</p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-playfair font-bold text-navy dark:text-white">
              Recent Orders
            </h2>
            <Link
              href={ROUTES.ADMIN_ORDERS}
              className="text-xs text-gold hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoadingOrders ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link key={order.id} href={ROUTES.ADMIN_ORDER(order.id)}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={order.user.avatar ?? ''} />
                      <AvatarFallback className="bg-navy text-white text-xs">
                        {order.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {order.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-navy dark:text-white">
                        {formatPrice(order.total)}
                      </p>
                      <Badge
                        className={cn(
                          'text-[10px] border-0',
                          STATUS_COLORS[order.status],
                        )}
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">
              No orders yet
            </p>
          )}
        </div>

        {/* Low Stock */}
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <h2 className="font-playfair font-bold text-navy dark:text-white">
                Low Stock Alerts
              </h2>
            </div>
            <Link
              href={ROUTES.ADMIN_PRODUCTS}
              className="text-xs text-gold hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoadingLowStock ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : lowStock && lowStock.products.length > 0 ? (
            <div className="space-y-3">
              {lowStock.products.map((product) => (
                <Link
                  key={product.id}
                  href={ROUTES.ADMIN_PRODUCT_EDIT(product.id)}
                >
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                      {product.primaryImage ? (
                        <Image
                          src={product.primaryImage}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.variants.length} variants
                      </p>
                    </div>
                    <Badge className="bg-warning/10 text-warning border-warning/20 shrink-0">
                      {product.totalStock} left
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">
              All products are well stocked
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
