'use client';
import { File } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import { getOrdersBySeller } from '@/services/order-service';
import type { Order } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function OrderRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
    </TableRow>
  );
}

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    async function fetchOrders() {
      if (user) {
        setLoading(true);
        const sellerOrders = await getOrdersBySeller(user.uid);
        setOrders(sellerOrders);
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') {
      return orders;
    }
    return orders.filter(order => order.orderStatus.toLowerCase() === statusFilter);
  }, [orders, statusFilter]);
  
  const getBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'fulfilled':
      case 'delivered':
      case 'shipped':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
      case 'declined':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  const handleExport = () => {
    const dataToExport = filteredOrders.map(order => ({
      'Order ID': order.orderNumber,
      'Customer Name': order.customerName || 'N/A',
      'Status': order.orderStatus,
      'Date': new Date(order.createdAt).toLocaleDateString(),
      'Total (₦)': order.grandTotal.toFixed(2),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, `seller-orders-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Tabs defaultValue="all" onValueChange={setStatusFilter}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="fulfilled">Fulfilled</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 gap-1"
              onClick={handleExport}
              disabled={loading || filteredOrders.length === 0}
            >
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export to Excel
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value={statusFilter}>
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                Manage your orders and view their details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <>
                      <OrderRowSkeleton />
                      <OrderRowSkeleton />
                      <OrderRowSkeleton />
                    </>
                  ) : filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                      <TableRow 
                        key={order.id} 
                        className="cursor-pointer"
                        onClick={() => router.push(`/seller/orders/${order.id}`)}
                      >
                        <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                        <TableCell>{order.customerName || order.userId}</TableCell>
                        <TableCell>
                          <Badge variant={getBadgeVariant(order.orderStatus)} className="capitalize">
                            {order.orderStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">₦{order.grandTotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing <strong>1-{filteredOrders.length}</strong> of <strong>{filteredOrders.length}</strong> orders
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
