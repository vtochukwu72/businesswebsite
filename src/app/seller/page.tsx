'use client';
import {
  Activity,
  ArrowUpRight,
  Package,
  CreditCard,
  DollarSign,
  ShoppingCart,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import type { Product, Order } from '@/lib/types';
import { getProductsBySeller } from '@/services/product-service';
import { getOrdersBySeller } from '@/services/order-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const dashboardStats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.grandTotal, 0);
    const totalSales = orders.length;
    const activeProducts = products.filter(p => p.isActive).length;
    
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const recentActivity = orders.filter(order => new Date(order.createdAt) > twentyFourHoursAgo).length;

    return {
      totalRevenue,
      totalSales,
      activeProducts,
      recentActivity,
    };
  }, [orders, products]);

  useEffect(() => {
    async function fetchData() {
      if (user) {
        setLoading(true);
        const [sellerProducts, sellerOrders] = await Promise.all([
          getProductsBySeller(user.uid),
          getOrdersBySeller(user.uid)
        ]);
        setProducts(sellerProducts);
        setOrders(sellerOrders);
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const recentOrders = orders.slice(0, 5);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">₦{dashboardStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            )}
            <p className="text-xs text-muted-foreground">
              +20.1% from last month (Static)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">+{dashboardStats.totalSales}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total sales from your products
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{dashboardStats.activeProducts}</div>
            )}
            <p className="text-xs text-muted-foreground">
              of {products.length} total products
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">+{dashboardStats.recentActivity}</div>}
            <p className="text-xs text-muted-foreground">
               New orders in last 24h
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                A quick look at your most recent orders.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/seller/orders">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Order ID
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Status
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Date
                  </TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="hidden xl:table-cell"><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.customerName || 'N/A'}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {/* Customer email could be here if available */}
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">#{order.orderNumber}</TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <Badge className="text-xs capitalize" variant="outline">
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">₦{order.grandTotal.toFixed(2)}</TableCell>
                  </TableRow>
                ))) : (
                   <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No recent orders.
                      </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
             <CardDescription>
                Your most recent sales from fulfilled orders.
              </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8">
            {loading ? <Skeleton className="h-12 w-full" /> : recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <div key={order.id} className="flex items-center gap-4">
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        {order.customerName || 'Anonymous Customer'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Order #{order.orderNumber}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">+₦{order.grandTotal.toFixed(2)}</div>
                  </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground">No recent sales found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
