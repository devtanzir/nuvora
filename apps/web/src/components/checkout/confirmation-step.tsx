'use client';

import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

interface ConfirmationStepProps {
  orderId: string;
  orderNumber?: string | null;
}

export function ConfirmationStep({ orderId, orderNumber }: ConfirmationStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="text-center space-y-6 py-8"
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="flex justify-center"
      >
        <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
      </motion.div>

      {/* Message */}
      <div className="space-y-2">
        <h2 className="text-2xl font-playfair font-bold text-navy dark:text-white">
          Order Placed!
        </h2>
        <p className="text-muted-foreground">
          Thank you for your purchase. Your order has been confirmed.
        </p>
      </div>

      {/* Order ID */}
      <div className="p-4 rounded-xl bg-muted/30 border border-border inline-block">
        <p className="text-xs text-muted-foreground mb-1">Order Number</p>
        <p className="text-sm font-mono font-medium text-navy dark:text-white">
          {orderNumber ?? orderId}
        </p>
      </div>

      {/* Info */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-left">
        <Package className="h-5 w-5 text-blue-600 shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-400">
          You will receive an email confirmation shortly. Track your order in your account.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          className="bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
          asChild
        >
          <Link href={ROUTES.ORDERS}>
            <Package className="mr-2 h-4 w-4" />
            View Orders
          </Link>
        </Button>
        <Button variant="outline" className="cursor-pointer" asChild>
          <Link href={ROUTES.PRODUCTS}>
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
