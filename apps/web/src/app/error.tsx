'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4 space-y-6">
        <div className="h-20 w-20 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-playfair font-bold text-navy dark:text-white">
            Something went wrong
          </h1>
          <p className="text-muted-foreground text-sm">
            We encountered an unexpected error. Please try again.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={reset}
            className="cursor-pointer"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            className="bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
            asChild
          >
            <Link href={ROUTES.HOME}>
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
