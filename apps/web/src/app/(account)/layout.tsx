import { Navbar } from '@/components/common/navbar/navbar.tsx';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
