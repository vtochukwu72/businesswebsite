import { Header } from '@/components/layout/header';
import { AccountNav } from '@/components/layout/account-nav';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="md:col-span-1">
            <h2 className="text-xl font-bold mb-4">My Account</h2>
            <AccountNav />
          </aside>
          <main className="md:col-span-3">{children}</main>
        </div>
      </div>
    </>
  );
}
