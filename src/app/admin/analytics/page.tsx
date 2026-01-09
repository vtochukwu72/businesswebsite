'use client';

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CreditCard, Users } from 'lucide-react';
import { FaNairaSign } from 'react-icons/fa6';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Order, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminAnalyticsPage() {
  const firestore = useFirestore();

  const allOrdersQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'orders') : null), [firestore]);
  const { data: allOrders, isLoading: isLoadingAllOrders } = useCollection<Order>(allOrdersQuery);

  const allUsersQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'users') : null), [firestore]);
  const { data: allUsers, isLoading: isLoadingAllUsers } = useCollection<User>(allUsersQuery);

  const { monthlySales, totalRevenue, totalSales, totalUsers } = useMemo(() => {
    if (!allOrders) {
      return {
        monthlySales: [],
        totalRevenue: 0,
        totalSales: 0,
        totalUsers: 0,
      };
    }

    const salesByMonth: { [key: string]: number } = {};
    allOrders.forEach((order) => {
      const date = new Date((order.createdAt as any).seconds * 1000);
      const month = date.toLocaleString('default', { month: 'short' });
      salesByMonth[month] = (salesByMonth[month] || 0) + order.grandTotal;
    });

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    
    const chartData = monthNames.map(name => ({
      name,
      total: salesByMonth[name] || 0,
    }));

    const revenue = allOrders
      .filter(o => o.orderStatus === 'delivered')
      .reduce((sum, order) => sum + order.grandTotal, 0);

    return {
      monthlySales: chartData,
      totalRevenue: revenue,
      totalSales: allOrders.length,
      totalUsers: allUsers?.length || 0,
    };
  }, [allOrders, allUsers]);
  
  const isLoading = isLoadingAllOrders || isLoadingAllUsers;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform Analytics</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
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
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Platform Sales Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          {isLoading ? (
            <div className="w-full h-[350px] flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlySales}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₦${value}`}
                />
                <Bar
                  dataKey="total"
                  fill="currentColor"
                  radius={[4, 4, 0, 0]}
                  className="fill-primary"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
