'use client';

import Link from 'next/link';
import {
  Bell,
  Home,
  Package,
  Package2,
  ShoppingCart,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'seller')) {
      router.push('/seller-login');
    }
  }, [user, userData, loading, router]);

  if (loading || !user || userData?.role !== 'seller') {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading vendor dashboard...</p>
        </div>
    );
  }

  return (
    <SidebarProvider>
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar>
        <SidebarContent>
            <SidebarHeader>
                 <Link href="/seller" className="flex items-center gap-2 font-semibold">
                    <Package2 className="h-6 w-6 text-primary" />
                    <span>Vendor Dashboard</span>
                </Link>
            </SidebarHeader>
           <SidebarGroup>
             <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton href="/seller" leftIcon={<Home/>}>Dashboard</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton href="/seller/orders" leftIcon={<ShoppingCart/>}>
                        Orders
                         <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">6</Badge>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton href="/seller/products" leftIcon={<Package/>}>Products</SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton href="#" leftIcon={<Users/>}>Customers</SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
           </SidebarGroup>
           <SidebarGroup className="mt-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Upgrade to Pro</CardTitle>
                    <CardDescription>
                        Unlock all features and get unlimited access to our support team.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button size="sm" className="w-full">Upgrade</Button>
                </CardContent>
            </Card>
           </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1">
            {/* Can add a search bar here if needed */}
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </header>
        <SidebarInset>
           {children}
        </SidebarInset>
      </div>
    </div>
    </SidebarProvider>
  );
}
