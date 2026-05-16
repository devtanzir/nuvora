import type { Metadata } from 'next';
import Link from 'next/link';
import { NuvoraLogo } from '@/components/common/icons/nuvora-logo';

export const metadata: Metadata = {
  title: 'Auth',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left - Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-navy p-12">
        <Link href="/" className="text-white text-2xl font-playfair font-bold">
          <NuvoraLogo className="h-auto w-32" />
        </Link>

        <div className="space-y-4">
          <h1 className="text-white text-4xl font-playfair font-bold leading-tight">
            Elevate Your Style,
            <br />
            <span className="text-gold">Define Your Aura</span>
          </h1>
          <p className="text-white/60 text-lg">
            Discover premium fashion curated for the modern individual.
          </p>
        </div>

        <p className="text-white/40 text-sm">
          © {new Date().getFullYear()} Nuvora. All rights reserved.
        </p>
      </div>

      {/* Right - Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link
            href="/"
            className="lg:hidden flex justify-center items-center mb-8"
          >
            <NuvoraLogo className="h-auto w-32" fillColor='#1B2D4F' />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
