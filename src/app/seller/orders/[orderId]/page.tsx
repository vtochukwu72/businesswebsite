'use client';
import { useEffect, useState, useTransition } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Home, User, Mail, Phone, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { updateOrderStatus } from './actions';
import Image from 'next/image';

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

export default function SellerOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, startTransition] = useTransition();

  const orderId = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/seller-login');
      return;
    }
    if (!orderId) {
      router.push('/seller/orders');
      return;
    }

    async function fetchOrder() {
      setLoading(true);
      const fetchedOrder = await getOrderById(orderId);
      
      if (!fetchedOrder || fetchedOrder.vendorId !== user?.uid) {
        toast({
          variant: 'destructive',
          title: 'Unauthorized',
          description: 'You are not authorized to view this order.',
        });
        router.push('/seller/orders');
        return;
      }
      
      setOrder(fetchedOrder);
      setLoading(false);
    }

    fetchOrder();
  }, [orderId, user, authLoading, router, toast]);
  
  const handleStatusChange = (newStatus: string) => {
    if (!order || !user) return;
    startTransition(async () => {
      const result = await updateOrderStatus(user.uid, order.id, newStatus);
      if (result.success) {
        toast({ title: 'Success', description: result.message });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };

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
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Order Details
        </h1>
        <Badge variant={getStatusBadgeVariant(order.orderStatus)} className="capitalize ml-auto sm:ml-0">
          {order.orderStatus}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr_1fr] lg:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
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
                                            <span className="font-medium">{item.name}</span>
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
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="font-medium">{order.shippingAddress.fullName}</div>
                <div className="text-muted-foreground">
                  {order.shippingAddress.street}, {order.shippingAddress.city}<br/>
                  {order.shippingAddress.state}, {order.shippingAddress.zipCode}<br/>
                  {order.shippingAddress.country}
                </div>
              </CardContent>
            </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleStatusChange} defaultValue={order.orderStatus} disabled={isUpdating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
                <div className="flex items-center gap-2 font-medium">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {order.customerName}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
