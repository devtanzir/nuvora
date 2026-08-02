import { Suspense } from 'react';
import { LoginRedirectHandler } from '@/components/common/login-redirect-handler';
import { MobileBottomNav } from '@/components/common/navbar/mobile-bottom-nav';
import Navbar from '@/components/common/navbar/navbar.tsx';
import SiteFooter from '@/components/common/footer/site-footer';

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
      <SiteFooter/>
      <MobileBottomNav />
    </Suspense>
  );
}
