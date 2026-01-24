
'use client';

import { AccountNav } from '@/components/layout/account-nav';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) {
      return; // Wait for the auth state to be determined
    }

    if (!user) {
      // If not logged in, redirect to the login page
      router.push('/login');
      return;
    }

    // If logged in, but the role is not 'customer', redirect to their respective dashboard.
    if (userData && userData.role !== 'customer') {
      const { role } = userData;
      let destination = '/login'; // Fallback
      if (role === 'seller') destination = '/seller';
      if (['admin', 'super_admin'].includes(role)) destination = '/admin';

      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: `This area is for customers. Redirecting you to your ${role} dashboard.`,
      });
      router.push(destination);
    }
  }, [user, userData, loading, router, toast]);

  // Render a loading state while we verify auth and role.
  // The condition now includes checking for the correct role.
  if (loading || !user || (userData && userData.role !== 'customer')) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center bg-muted/40">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
        <p className="mt-4 text-muted-foreground">Verifying access...</p>
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
