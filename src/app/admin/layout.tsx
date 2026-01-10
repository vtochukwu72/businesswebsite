'use client';
import Link from 'next/link';
import { use, type ReactNode } from 'react';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  LineChart,
  Settings,
  MessageCircleQuestion,
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


const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  {
    href: '/admin/contact-messages',
    label: 'Contact Messages',
    icon: MessageCircleQuestion,
  },
  { href: '/admin/analytics', label: 'Analytics', icon: LineChart },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const authContext = use(AuthContext);
  const router = useRouter();

  if (authContext?.loading) {
    return <FullScreenLoader />;
  }

  // After loading, if user is not authenticated or not an admin, redirect
  if (!authContext?.isAuthenticated || !authContext.isAdmin) {
    router.push('/admin-login');
    return <FullScreenLoader />; // Show loader while redirecting
  }

  // If authenticated and is an admin, render the dashboard
  return (
     <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <Link
              href="/admin"
              className="flex items-center gap-2 font-bold text-lg"
            >
              Admin Panel
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
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


export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <FirebaseClientProvider>
      <AdminDashboardLayout>{children}</AdminDashboardLayout>
    </FirebaseClientProvider>
  );
}
