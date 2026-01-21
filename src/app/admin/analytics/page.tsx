'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Order, User } from '@/lib/types';
import { subDays, format } from 'date-fns';
import { DollarSign, Users, CreditCard, File } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';

// Analytics Page Component
export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    let ordersLoaded = false;
    let usersLoaded = false;

    const doneLoading = () => {
      if (ordersLoaded && usersLoaded) setLoading(false);
    };

    const ordersUnsub = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snapshot) => {
      const orderList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as Order;
      });
      setOrders(orderList);
      ordersLoaded = true;
      doneLoading();
    }, (error) => {
        console.error("Analytics (orders) snapshot error: ", error);
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "Could not load live order data for analytics."
        });
        ordersLoaded = true;
        setOrders([]);
        doneLoading();
    });

    const usersUnsub = onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc')), (snapshot) => {
      const userList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as User;
      });
      setUsers(userList);
      usersLoaded = true;
      doneLoading();
    }, (error) => {
        console.error("Analytics (users) snapshot error: ", error);
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "Could not load live user data for analytics."
        });
        usersLoaded = true;
        setUsers([]);
        doneLoading();
    });

    return () => {
      ordersUnsub();
      usersUnsub();
    };
  }, [toast]);

  const { totalRevenue, totalOrders, totalUsers, salesData, signupsData } = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.grandTotal, 0);
    const totalOrders = orders.length;
    const totalUsers = users.length;
    
    // Process data for charts - last 30 days
    const today = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(today, 29-i);
        return format(date, 'MMM d');
    });

    const dailySales = last30Days.reduce((acc, day) => {
        acc[day] = 0;
        return acc;
    }, {} as Record<string, number>);

    const dailySignups = last30Days.reduce((acc, day) => {
        acc[day] = { customers: 0, sellers: 0 };
        return acc;
    }, {} as Record<string, { customers: number; sellers: number }>);


    orders.forEach(order => {
        const day = format(new Date(order.createdAt), 'MMM d');
        if (day in dailySales) {
            dailySales[day] += order.grandTotal;
        }
    });

    users.forEach(user => {
        const day = format(new Date(user.createdAt), 'MMM d');
        if (day in dailySignups) {
            if (user.role === 'customer') dailySignups[day].customers += 1;
            else if (user.role === 'seller') dailySignups[day].sellers += 1;
        }
    });

    const salesData = last30Days.map(day => ({ name: day, revenue: dailySales[day] || 0 }));
    const signupsData = last30Days.map(day => ({ name: day, ...dailySignups[day] }));


    return { totalRevenue, totalOrders, totalUsers, salesData, signupsData };
  }, [orders, users]);
  
  const { roleDistribution, orderStatusDistribution } = useMemo(() => {
    const roleCounts = users.reduce((acc, user) => {
        const role = user.role.replace('_', ' ');
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const orderStatusCounts = orders.reduce((acc, order) => {
        const status = order.orderStatus.toLowerCase();
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const roleDistribution = Object.entries(roleCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
    const orderStatusDistribution = Object.entries(orderStatusCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

    return { roleDistribution, orderStatusDistribution };
  }, [users, orders]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const salesChartConfig = {
    revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
  } satisfies ChartConfig;

  const signupsChartConfig = {
    customers: { label: 'Customers', color: 'hsl(var(--chart-1))' },
    sellers: { label: 'Sellers', color: 'hsl(var(--chart-2))' },
  } satisfies ChartConfig;

  const handleExport = () => {
    const workbook = XLSX.utils.book_new();

    const summaryData = [
      { Metric: 'Total Revenue', Value: `₦${totalRevenue.toLocaleString()}` },
      { Metric: 'Total Orders', Value: totalOrders },
      { Metric: 'Total Users', Value: totalUsers },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    const formattedSalesData = salesData.map(d => ({ 'Date': d.name, 'Revenue (₦)': d.revenue }));
    const salesSheet = XLSX.utils.json_to_sheet(formattedSalesData);
    XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales (Last 30 Days)');
    
    const formattedSignupsData = signupsData.map(d => ({ 'Date': d.name, 'New Customers': d.customers, 'New Sellers': d.sellers }));
    const signupsSheet = XLSX.utils.json_to_sheet(formattedSignupsData);
    XLSX.utils.book_append_sheet(workbook, signupsSheet, 'Signups (Last 30 Days)');
    
    const roleSheet = XLSX.utils.json_to_sheet(roleDistribution.map(d => ({'Role': d.name, 'Count': d.value})));
    XLSX.utils.book_append_sheet(workbook, roleSheet, 'User Role Distribution');

    const statusSheet = XLSX.utils.json_to_sheet(orderStatusDistribution.map(d => ({'Status': d.name, 'Count': d.value})));
    XLSX.utils.book_append_sheet(workbook, statusSheet, 'Order Status Distribution');
    
    XLSX.writeFile(workbook, `analytics-export-${new Date().toISOString().split('T')[0]}.xlsx`);
  };


  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /></CardContent></Card>
        </div>
        <Card className="h-[400px]"><CardHeader><Skeleton className="h-4 w-32" /></CardHeader><CardContent><Skeleton className="h-full w-full" /></CardContent></Card>
        <Card className="h-[400px]"><CardHeader><Skeleton className="h-4 w-32" /></CardHeader><CardContent><Skeleton className="h-full w-full" /></CardContent></Card>
        <div className="grid gap-4 md:grid-cols-2">
            <Card className="h-[300px]"><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-full w-full" /></CardContent></Card>
            <Card className="h-[300px]"><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-full w-full" /></CardContent></Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <Button
                onClick={handleExport}
                disabled={loading}
                variant="outline"
                size="sm"
            >
                <File className="mr-2 h-4 w-4" />
                Export to Excel
            </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across all time</p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+{totalOrders.toLocaleString()}</div>
                 <p className="text-xs text-muted-foreground">Across all time</p>
            </CardContent>
            </Card>
             <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+{totalUsers.toLocaleString()}</div>
                 <p className="text-xs text-muted-foreground">Customers, Sellers & Admins</p>
            </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Sales Over Last 30 Days</CardTitle>
                <CardDescription>Daily revenue from all orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={salesChartConfig} className="h-[350px] w-full">
                    <BarChart accessibilityLayer data={salesData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                         <YAxis
                            tickFormatter={(value) => `₦${Number(value) / 1000}k`}
                         />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>New Users Over Last 30 Days</CardTitle>
                <CardDescription>Daily customer and seller signups.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={signupsChartConfig} className="h-[350px] w-full">
                    <AreaChart
                        accessibilityLayer
                        data={signupsData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                        >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                         <Area
                            dataKey="customers"
                            type="natural"
                            fill="var(--color-customers)"
                            fillOpacity={0.4}
                            stroke="var(--color-customers)"
                            stackId="a"
                        />
                        <Area
                            dataKey="sellers"
                            type="natural"
                            fill="var(--color-sellers)"
                            fillOpacity={0.4}
                            stroke="var(--color-sellers)"
                            stackId="a"
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>User Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={{}} className="h-[250px] w-full">
                         <PieChart>
                            <Pie data={roleDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {roleDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                   <ChartContainer config={{}} className="h-[250px] w-full">
                         <PieChart>
                            <Pie data={orderStatusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {orderStatusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </main>
  );
}
