'use client';

import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  type WithId,
} from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import type { Order } from '@/lib/types';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminOrdersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const ordersQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'))
        : null,
    [firestore]
  );
  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!firestore) return;
    const orderRef = doc(firestore, 'orders', orderId);
    try {
      await updateDoc(orderRef, { orderStatus: status });
      toast({
        title: 'Order Status Updated',
        description: `Order has been marked as ${status}.`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update order status.',
      });
    }
  };

  const updatePaymentStatus = async (orderId: string, status: string) => {
    if (!firestore) return;
    const orderRef = doc(firestore, 'orders', orderId);
    try {
      await updateDoc(orderRef, { 'paymentDetails.status': status });
      toast({
        title: 'Payment Status Updated',
        description: `Payment has been marked as ${status}.`,
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update payment status.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
        <CardDescription>
          Manage all customer orders from a single dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {orders?.map((order: WithId<Order>) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  #{order.orderNumber}
                </TableCell>
                <TableCell>{order.userId}</TableCell>
                <TableCell>
                  {new Date(
                    (order.createdAt as any).seconds * 1000
                  ).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {order.orderStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.paymentDetails.status === 'completed'
                        ? 'default'
                        : 'secondary'
                    }
                    className="capitalize"
                  >
                    {order.paymentDetails.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  ₦{order.grandTotal.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          Update Order Status
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            {[
                              'pending',
                              'confirmed',
                              'processing',
                              'shipped',
                              'delivered',
                              'cancelled',
                            ].map((status) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={() => updateOrderStatus(order.id, status)}
                                className="capitalize"
                              >
                                {status}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          Update Payment Status
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            {['pending', 'completed', 'failed'].map(
                              (status) => (
                                <DropdownMenuItem
                                  key={status}
                                  onClick={() =>
                                    updatePaymentStatus(order.id, status)
                                  }
                                  className="capitalize"
                                >
                                  {status}
                                </DropdownMenuItem>
                              )
                            )}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!isLoading && orders?.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <h3 className="text-lg font-semibold">No orders found.</h3>
            <p>New orders from customers will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    