'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-background font-sans antialiased">
        <div className="text-center max-w-md px-4 space-y-6">
          <div className="h-20 w-20 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-playfair font-bold text-navy dark:text-white">
              Critical Error
            </h1>
            <p className="text-muted-foreground text-sm">
              The application encountered a critical error and cannot recover.
            </p>
          </div>

          <Button
            onClick={reset}
            className="bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Application
          </Button>
        </div>
      </body>
    </html>
  );
}
