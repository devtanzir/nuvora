import { Suspense } from 'react';
import { Navbar } from '@/components/common/navbar';
import { LoginRedirectHandler } from '@/components/common/login-redirect-handler';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <LoginRedirectHandler />
      <Navbar />
      <main>{children}</main>
    </Suspense>
  );
}
