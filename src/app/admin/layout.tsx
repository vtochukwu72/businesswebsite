
'use client';

import Link from 'next/link';
import {
  Bell,
  Home,
  Package,
  Package2,
  ShoppingCart,
  Users,
  LineChart,
  Store,
  MessageSquare,
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
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function AdminDashboard({ children, notificationCount, authProps }: { children: React.ReactNode, notificationCount: number, authProps: AuthContextType }) {
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
      router.push('/admin-login');
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
                 <Link href="/admin" className="flex items-center gap-2 font-semibold">
                    <Package2 className="h-6 w-6 text-primary" />
                    <span>Admin Panel</span>
                </Link>
            </SidebarHeader>
           <SidebarGroup>
             <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton href="/admin" leftIcon={<Home/>}>Dashboard</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton href="/admin/orders" leftIcon={<ShoppingCart/>}>
                        Orders
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton href="/admin/products" leftIcon={<Package/>}>Products</SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton href="/admin/customers" leftIcon={<Users/>}>Customers</SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton href="/admin/vendors" leftIcon={<Store/>}>Vendors</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton href="/admin/messages" leftIcon={<MessageSquare />}>Messages</SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton href="/admin/analytics" leftIcon={<LineChart/>}>Analytics</SidebarMenuButton>
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
             {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full p-0 text-xs">
                    {notificationCount}
                </Badge>
            )}
            <span className="sr-only">Toggle notifications</span>
          </Button>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.photoURL || userData?.photoURL || ''} alt={userData?.displayName || 'Admin'} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {(userData?.fname?.[0] || userData?.displayName?.[0] || user?.email?.[0] || 'A').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/admin">Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem disabled>Settings</DropdownMenuItem>
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authProps = useAuth();
  const { user, userData, loading } = authProps;
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/admin-login');
      return;
    }

    if (userData && !['admin', 'super_admin'].includes(userData.role)) {
      const { role } = userData;
      let destination = '/login'; // Fallback
      if (role === 'customer') destination = '/account';
      if (role === 'seller') destination = '/seller';

      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: `This is an admin-only area. Redirecting you to your ${role} dashboard.`,
      });
      router.push(destination);
    }
  }, [user, userData, loading, router, toast]);
  
  useEffect(() => {
    if (!user) {
      setNotificationCount(0);
      return;
    }
    
    // Listen for unread messages. This is the only notification source now.
    const messagesQuery = query(collection(db, 'contacts'), where('isRead', '==', false));
    const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
        setNotificationCount(snapshot.size);
    }, (error) => {
        const permissionError = new FirestorePermissionError({
            path: 'contacts',
            operation: 'list'
        }, error);
        errorEmitter.emit('permission-error', permissionError);

        console.error("Notification (messages) snapshot error:", error);
        toast({
          variant: "destructive",
          title: "Could not load notifications",
          description: "There was a problem fetching live message updates."
        });
        setNotificationCount(0);
    });

    return () => {
        unsubMessages();
    }
  }, [user, toast]);

  if (loading || !user || !userData?.role || !['admin', 'super_admin'].includes(userData.role)) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
        </div>
    );
  }

  if (!isClient) {
    return null;
  }

  return (
    <AdminDashboard notificationCount={notificationCount} authProps={authProps}>
        {children}
    </AdminDashboard>
  );
}
