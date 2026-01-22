'use client';

import Link from 'next/link';
import {
  Bell,
  Home,
  Package,
  Package2,
  ShoppingCart,
  Users,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth, AuthContextType } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useToast } from '@/hooks/use-toast';

function SellerDashboard({ children, pendingOrderCount, authProps }: { children: React.ReactNode; pendingOrderCount: number, authProps: AuthContextType }) {
  const { user, userData, logout } = authProps;
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/seller-login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'An error occurred while logging out.',
      });
    }
  };

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
                           {pendingOrderCount > 0 && (
                            <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">{pendingOrderCount}</Badge>
                           )}
                      </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                      <SidebarMenuButton href="/seller/products" leftIcon={<Package/>}>Products</SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                      <SidebarMenuButton href="/seller/customers" leftIcon={<Users/>}>Customers</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                      <SidebarMenuButton href="/seller/settings" leftIcon={<Settings/>}>Settings</SidebarMenuButton>
                  </SidebarMenuItem>
               </SidebarMenu>
             </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="w-full flex-1">
              {/* Can add a search bar here if needed */}
            </div>
             <Button variant="outline" size="icon" className="relative h-8 w-8">
                <Bell className="h-4 w-4" />
                 {pendingOrderCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full p-0 text-xs">{pendingOrderCount}</Badge>
                )}
                <span className="sr-only">Toggle notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.photoURL || userData?.photoURL || ''} alt={userData?.displayName || 'Seller'} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {(userData?.fname?.[0] || userData?.displayName?.[0] || user?.email?.[0] || 'S').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/seller">Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/seller/settings">Settings</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <SidebarInset>
             {children}
          </SidebarInset>
        </div>
      </div>
      </SidebarProvider>
  )
}

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authProps = useAuth();
  const { user, userData, loading } = authProps;
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && (!user || userData?.role !== 'seller')) {
      router.push('/seller-login');
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    if (!user) {
      setPendingOrderCount(0);
      return;
    }

    // Use onSnapshot for real-time updates on pending orders
    const ordersQuery = query(collection(db, 'vendors', user.uid, 'orders'), where('orderStatus', '==', 'pending'));
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      setPendingOrderCount(snapshot.size);
    }, (error) => {
      console.error("Seller notification (orders) snapshot error:", error);
      toast({
        variant: "destructive",
        title: "Could not load notifications",
        description: "There was a problem fetching live order updates."
      });
      setPendingOrderCount(0);
    });

    return () => unsubscribe();
  }, [user, toast]);


  if (loading || !user || userData?.role !== 'seller') {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading vendor dashboard...</p>
        </div>
    );
  }
  
  if (!isClient) {
    return null;
  }

  return (
    <SellerDashboard pendingOrderCount={pendingOrderCount} authProps={authProps}>{children}</SellerDashboard>
  );
}
