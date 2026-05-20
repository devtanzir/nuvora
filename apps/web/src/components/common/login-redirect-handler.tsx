'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';

export function LoginRedirectHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openLoginModal } = useUIStore();
  const { isAuthenticated } = useAuthStore();

  // Open modal if ?login=true
  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      openLoginModal();
      const url = new URL(window.location.href);
      url.searchParams.delete('login');
      router.replace(url.pathname + (url.search || ''));
    }
  }, [searchParams, openLoginModal, router]);

  // Redirect after login
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (isAuthenticated && redirect) {
      router.push(redirect);
    }
  }, [isAuthenticated, searchParams, router]);

  return null;
}
