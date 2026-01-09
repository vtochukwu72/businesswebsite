'use client';

import {
  useUser,
  useCollection,
  useFirestore,
  useMemoFirebase,
  type WithId,
} from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
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
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function AccountOrdersPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, 'orders'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          )
        : null,
    [firestore, user]
  );
  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
        <CardDescription>
          Check the status of your recent orders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-20" />
                  </TableCell>
                </TableRow>
              ))}
            {orders?.map((order: WithId<Order>) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  #{order.orderNumber}
                </TableCell>
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
                <TableCell>₦{order.grandTotal.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!isLoading && orders?.length === 0 && (
          <div className="text-center py-20 border-dashed border-2 rounded-lg">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-6 text-xl font-semibold">
              You haven&apos;t placed any orders yet.
            </h2>
            <p className="mt-2 text-muted-foreground">
              When you do, their status will appear here.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    