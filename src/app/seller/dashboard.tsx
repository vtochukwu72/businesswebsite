'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity, CreditCard, Package } from 'lucide-react';
import { FaNairaSign } from 'react-icons/fa6';
import {
  useUser,
  useCollection,
  useFirestore,
  useMemoFirebase,
  type WithId,
} from '@/firebase';
import { collection, query, limit, orderBy, where } from 'firebase/firestore';
import type { Order, Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function SellerDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const recentOrdersQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, 'vendors', user.uid, 'orders'),
            orderBy('createdAt', 'desc'),
            limit(5)
          )
        : null,
    [firestore, user]
  );
  const { data: recentOrders, isLoading: isLoadingOrders } =
    useCollection<Order>(recentOrdersQuery);

  const productsQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, 'products'),
            where('sellerId', '==', user.uid)
          )
        : null,
    [firestore, user]
  );
  const { data: products, isLoading: isLoadingProducts } =
    useCollection<Product>(productsQuery);

  const allOrdersQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(collection(firestore, 'vendors', user.uid, 'orders'))
        : null,
    [firestore, user]
  );
  const { data: allOrders, isLoading: isLoadingAllOrders } =
    useCollection<Order>(allOrdersQuery);

  const totalRevenue =
    allOrders
      ?.filter((order) => order.orderStatus === 'delivered')
      .reduce((sum, order) => sum + order.totalAmount, 0) || 0;

  const totalSales = allOrders?.length || 0;
  const totalProducts = products?.length || 0;
  const pendingOrders =
    allOrders?.filter((order) => order.orderStatus === 'pending').length || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <FaNairaSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingAllOrders ? (
              <Skeleton className="h-8 w-2/3" />
            ) : (
              <div className="text-2xl font-bold">
                ₦{totalRevenue.toFixed(2)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Based on completed orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">{totalProducts}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total products in your store
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingAllOrders ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">+{totalSales}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total orders received
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingAllOrders ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">+{pendingOrders}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Orders awaiting processing
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>A list of your most recent orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingOrders &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  </TableRow>
                ))}
              {recentOrders?.map((order: WithId<Order>) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium">{order.userId}</div>
                    <div className="text-sm text-muted-foreground">
                      {/* Customer email could be denormalized here */}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.orderStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(
                      (order.createdAt as any).seconds * 1000
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ₦{order.totalAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoadingOrders && recentOrders?.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <h3 className="text-lg font-semibold">No recent orders.</h3>
              <p>New orders from your customers will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
