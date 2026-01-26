'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getOrderById } from '@/services/order-service';
import type { Order, OrderItem } from '@/lib/types';
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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Package, User, Mail, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';

function OrderDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-1/4" />
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
          <CardContent><Skeleton className="h-20 w-full" /></CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CustomerOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!orderId) {
      router.push('/account/orders');
      return;
    }

    async function fetchOrder() {
      setLoading(true);
      const fetchedOrder = await getOrderById(orderId);
      
      if (!fetchedOrder || fetchedOrder.userId !== user?.uid) {
        toast({
          variant: 'destructive',
          title: 'Unauthorized',
          description: 'You are not authorized to view this order.',
        });
        router.push('/account/orders');
        return;
      }
      
      setOrder(fetchedOrder);
      setLoading(false);
    }

    fetchOrder();
  }, [orderId, user, authLoading, router, toast]);
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'fulfilled': case 'shipped': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading || authLoading) {
    return (
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <OrderDetailsSkeleton />
      </main>
    );
  }

  if (!order) {
    return null; 
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.push('/account/orders')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back to Orders</span>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Order Details
        </h1>
        <Badge variant={getStatusBadgeVariant(order.orderStatus)} className="capitalize ml-auto sm:ml-0">
          {order.orderStatus}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="grid auto-rows-max items-start gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Order #{order.orderNumber}</CardTitle>
                    <CardDescription>
                        Date: {new Date(order.createdAt).toLocaleDateString()}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.items.map((item: OrderItem) => (
                                <TableRow key={item.productId}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Image src={item.image} alt={item.name} width={40} height={40} className="rounded-md object-cover" />
                                            <Link href={`/products/${item.productId}`} className="font-medium hover:underline">{item.name}</Link>
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell className="text-right">₦{item.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">₦{(item.price * item.quantity).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex-col items-end gap-2 border-t pt-6">
                    <div className="flex justify-between w-full max-w-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₦{order.totalAmount.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between w-full max-w-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>₦{order.shippingFee.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between w-full max-w-sm">
                        <span className="text-muted-foreground">Taxes</span>
                        <span>₦{order.taxAmount.toFixed(2)}</span>
                    </div>
                     <Separator className="my-2 max-w-sm"/>
                     <div className="flex justify-between w-full max-w-sm font-bold text-lg">
                        <span>Total</span>
                        <span>₦{order.grandTotal.toFixed(2)}</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-6">
          <Card>
            <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
                 <div className="flex items-center gap-2 font-medium">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {order.shippingAddress.fullName}
                </div>
                 <div className="flex items-start gap-2 text-muted-foreground mt-2">
                    <Home className="h-4 w-4 mt-0.5" />
                    <div>
                        {order.shippingAddress.street}, {order.shippingAddress.city}<br/>
                        {order.shippingAddress.state}, {order.shippingAddress.zipCode}<br/>
                        {order.shippingAddress.country}
                    </div>
                </div>
            </CardContent>
          </Card>
            <Card>
            <CardHeader>
                <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-20">Method:</span>
                    <span className="font-medium">{order.paymentDetails.method}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-20">Status:</span>
                     <Badge variant={order.paymentDetails.status === 'paid' ? 'default' : 'secondary'} className="capitalize">{order.paymentDetails.status}</Badge>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
