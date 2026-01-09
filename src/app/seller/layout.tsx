'use client';
import Link from 'next/link';
import { use, type ReactNode, useEffect } from 'react';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  LineChart,
  Settings,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthContext } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import SellerLoginPage from './login/page';

const sellerNavItems = [
  { href: '/seller', label: 'Dashboard', icon: Home },
  { href: '/seller/products', label: 'Products', icon: Package },
  { href: '/seller/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/seller/reviews', label: 'Reviews', icon: Users },
  { href: '/seller/analytics', label: 'Analytics', icon: LineChart },
  { href: '/seller/settings', label: 'Store Settings', icon: Settings },
];

function SellerDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link
            href="/seller"
            className="flex items-center gap-2 font-bold text-lg"
          >
            Seller Dashboard
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {sellerNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild tooltip={{ children: item.label }}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

const FullScreenLoader = () => (
    <div className="flex h-screen items-center justify-center">
        <div className="w-full h-full">
            <Skeleton className="w-full h-full" />
        </div>
    </div>
);

export default function SellerLayout({ children }: { children: ReactNode }) {
  const authContext = use(AuthContext);
  
  if (authContext?.loading) {
    return <FullScreenLoader />;
  }

  const isSeller = authContext?.userData?.role === 'seller';

  if (!authContext?.isAuthenticated || !isSeller) {
     return (
       <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <SellerLoginPage />
      </div>
    );
  }

  // Render the full dashboard layout for authenticated sellers
  return (
    <FirebaseClientProvider>
      <SellerDashboardLayout>{children}</SellerDashboardLayout>
    </FirebaseClientProvider>
  );
}
