'use client';
import {
  Activity,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Users,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';

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
import type { Order, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    let ordersLoaded = false;
    let usersLoaded = false;

    const doneLoading = () => {
      if (ordersLoaded && usersLoaded) {
        setLoading(false);
      }
    };

    const ordersUnsub = onSnapshot(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const orderList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          } as Order;
        });
        setOrders(orderList);
        ordersLoaded = true;
        doneLoading();
      },
      (err) => {
        console.error("Error fetching orders snapshot:", err);
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "Could not load live order data."
        });
        ordersLoaded = true;
        setOrders([]);
        doneLoading();
      }
    );

    const usersUnsub = onSnapshot(
      query(collection(db, 'users'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const userList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          } as User;
        });
        setUsers(userList);
        usersLoaded = true;
        doneLoading();
      },
      (err) => {
        console.error("Error fetching users snapshot:", err);
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "Could not load live user data."
        });
        usersLoaded = true;
        setUsers([]);
        doneLoading();
      }
    );

    return () => {
      ordersUnsub();
      usersUnsub();
    };
  }, [toast]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.grandTotal, 0);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    const recentOrdersCount = orders.filter(
      (order) => new Date(order.createdAt) > twentyFourHoursAgo
    ).length;
    const recentUsersCount = users.filter(
      (user) => new Date(user.createdAt) > twentyFourHoursAgo
    ).length;
    const recentActivity = recentOrdersCount + recentUsersCount;

    return {
      totalRevenue,
      totalSales: orders.length,
      totalUsers: users.length,
      recentActivity,
    };
  }, [orders, users]);
  
  const recentSignups = users.slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'fulfilled':
      case 'shipped':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
   const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return 'destructive';
      case 'seller':
        return 'secondary';
      default:
        return 'default';
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
            <p className="text-xs text-muted-foreground">
              From {stats.totalSales.toLocaleString()} total sales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20"/> : <div className="text-2xl font-bold">+{stats.totalSales.toLocaleString()}</div>}
            <p className="text-xs text-muted-foreground">
              +15% from last month (Static)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16"/> : <div className="text-2xl font-bold">+{stats.totalUsers.toLocaleString()}</div>}
            <p className="text-xs text-muted-foreground">
              Total customers, sellers, and admins
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">+{stats.recentActivity}</div>}
            <p className="text-xs text-muted-foreground">
              New users & orders in last 24h
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Most recent orders from your platform.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/admin/orders">
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
                    Status
                  </TableHead>
                  <TableHead className="hidden md:table-cell lg:hidden xl:table-column">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center h-24">Loading transactions...</TableCell></TableRow>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium">{order.customerName || 'N/A'}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {users.find(u => u.id === order.userId)?.email}
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <Badge className="text-xs capitalize" variant={getBadgeVariant(order.orderStatus)}>
                          {order.orderStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell lg:hidden xl:table-column">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">₦{order.grandTotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={4} className="text-center h-24">No recent transactions.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
            <CardDescription>
              Newest users who joined the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {loading ? (
                <div className="text-sm text-muted-foreground">Loading users...</div>
            ) : recentSignups.length > 0 ? (
              recentSignups.map(user => (
                <div key={user.id} className="flex items-center gap-4">
                  <Avatar className="hidden h-9 w-9 sm:flex">
                    <AvatarImage src={user.photoURL} alt="Avatar" />
                    <AvatarFallback>{(user.displayName || user.email).charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1 flex-1">
                    <p className="text-sm font-medium leading-none truncate">
                      {user.displayName || user.email}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                   <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">{user.role.replace('_', ' ')}</Badge>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No recent signups.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
