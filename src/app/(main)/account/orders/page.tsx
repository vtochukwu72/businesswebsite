'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
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
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { serializeFirestoreData } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function OrderRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
    </TableRow>
  );
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    
    if (!user) {
      setLoading(false);
      setOrders([]);
      return;
    }

    // NOTE: This query requires a composite index in Firestore. 
    // If you see an error in the console about a missing index, please click the link
    // in the error message to create it in your Firebase console.
    // The query filters by `userId` and orders by `createdAt`.
    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...serializeFirestoreData(doc.data()),
      }) as Order);
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user orders:", error);
      const permissionError = new FirestorePermissionError({
        path: 'orders',
        operation: 'list'
      }, error);
      errorEmitter.emit('permission-error', permissionError);

      toast({
        variant: "destructive",
        title: "Permission Error",
        description: "Could not load your orders."
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading, toast]);

  const getBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            View and track your recent orders. Updates will appear in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
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
              ) : orders.length > 0 ? (
                orders.map(order => (
                  <TableRow key={order.id} className="cursor-pointer" onClick={() => router.push(`/account/orders/${order.id}`)}>
                    <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                    <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(order.orderStatus)} className="capitalize">
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">₦{order.grandTotal.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    You haven't placed any orders yet.
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
