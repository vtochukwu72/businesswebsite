'use client';

import {
  useUser,
  useCollection,
  useFirestore,
  useMemoFirebase,
  type WithId,
} from '@/firebase';
import { collection, query, doc, updateDoc } from 'firebase/firestore';
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SellerOrdersPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const ordersQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(collection(firestore, 'vendors', user.uid, 'orders'))
        : null,
    [firestore, user]
  );
  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);
  
  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!firestore || !user) return;
    // Note: This updates the seller-specific order. A Cloud Function
    // would ideally keep this in sync with the main /orders/{orderId} doc.
    const orderRef = doc(firestore, 'vendors', user.uid, 'orders', orderId);
    try {
      await updateDoc(orderRef, { orderStatus: status });
      toast({
        title: 'Order Status Updated',
        description: `Order #${orderId.substring(0, 7)} has been marked as ${status}.`,
      });
    } catch (error) {
       console.error("Error updating status: ", error);
       toast({
        variant: "destructive",
        title: 'Update Failed',
        description: 'Could not update the order status.',
      });
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Orders</CardTitle>
        <CardDescription>
          A list of all the orders from your customers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
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
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            {orders?.map((order: WithId<Order>) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                <TableCell>{order.userId}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{order.orderStatus}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(
                    (order.createdAt as any).seconds * 1000
                  ).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  ₦{order.totalAmount.toFixed(2)}
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
                        <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                           <DropdownMenuSubContent>
                            {[
                              'pending',
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
                      <DropdownMenuItem>Contact Customer</DropdownMenuItem>
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
            <p>New orders from your customers will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
    
