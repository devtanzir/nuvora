'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/constants/routes';

function VerifyEmailHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      // avoid synchronous setState inside effect to prevent cascading renders
      // schedule update to next tick
      setTimeout(() => setStatus('error'));
      return;
    }

    authService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-gold mx-auto" />
        <p className="text-muted-foreground">Verifying your email...</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
        <h2 className="text-2xl font-playfair font-bold text-navy dark:text-white">
          Email Verified!
        </h2>
        <p className="text-muted-foreground">
          Your email has been verified successfully.
        </p>
        <Button
          className="bg-navy hover:bg-navy-light text-white cursor-pointer"
          onClick={() => router.push(ROUTES.LOGIN)}
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <XCircle className="h-12 w-12 text-destructive mx-auto" />
      <h2 className="text-2xl font-playfair font-bold text-navy dark:text-white">
        Verification Failed
      </h2>
      <p className="text-muted-foreground">
        Invalid or expired verification link.
      </p>
      <Button
        variant="outline"
        className="cursor-pointer"
        onClick={() => router.push(ROUTES.LOGIN)}
      >
        Back to Login
      </Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gold mx-auto" />
        </div>
      }
    >
      <VerifyEmailHandler />
    </Suspense>
  );
}
