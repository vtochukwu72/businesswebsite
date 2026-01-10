
'use client';

import { AccountNav } from '@/components/layout/account-nav';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading your account...</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <aside>
          <AccountNav />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
