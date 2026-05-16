'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { authCookies } from '@/lib/auth';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/constants/routes';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      router.push(ROUTES.LOGIN);
      return;
    }

    authCookies.setToken(token);

    authService
      .getMe()
      .then((user) => {
        setAuth(user, token);
        if (user.role === 'ADMIN') {
          router.push(ROUTES.ADMIN);
        } else {
          router.push(ROUTES.HOME);
        }
      })
      .catch(() => {
        authCookies.removeToken();
        router.push(ROUTES.LOGIN);
      });
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto" />
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
