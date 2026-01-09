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
import { Activity, CreditCard, Users } from 'lucide-react';
import { FaNairaSign } from 'react-icons/fa6';
import { useCollection, useFirestore, useMemoFirebase, type WithId } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import type { Order, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const firestore = useFirestore();

  const recentOrdersQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'), limit(5))
        : null,
    [firestore]
  );
  const { data: recentOrders, isLoading: isLoadingOrders } = useCollection<Order>(recentOrdersQuery);

  const allOrdersQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'orders') : null), [firestore]);
  const { data: allOrders, isLoading: isLoadingAllOrders } = useCollection<Order>(allOrdersQuery);

  const allUsersQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'users') : null), [firestore]);
  const { data: allUsers, isLoading: isLoadingAllUsers } = useCollection<User>(allUsersQuery);
  
  const totalRevenue = allOrders
      ?.filter((order) => order.orderStatus === 'delivered')
      .reduce((sum, order) => sum + order.grandTotal, 0) || 0;
      
  const totalSales = allOrders?.length || 0;
  const totalUsers = allUsers?.length || 0;
  
  const isLoading = isLoadingOrders || isLoadingAllOrders || isLoadingAllUsers;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <FaNairaSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-2/3" /> : <div className="text-2xl font-bold">₦{totalRevenue.toFixed(2)}</div>}
            <p className="text-xs text-muted-foreground">
              Based on all completed orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">+{totalUsers}</div>}
            <p className="text-xs text-muted-foreground">
              Total registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">+{totalSales}</div>}
            <p className="text-xs text-muted-foreground">
              Total orders on the platform
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour (static)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>A list of the most recent orders.</CardDescription>
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
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24" />
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
                    <div className="font-medium">{order.shippingAddress.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.userId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{order.orderStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(
                      (order.createdAt as any).seconds * 1000
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ₦{order.grandTotal.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
               {!isLoadingOrders && recentOrders?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No recent orders.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
