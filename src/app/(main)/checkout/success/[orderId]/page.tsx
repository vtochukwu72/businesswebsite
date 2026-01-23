'use client';

import Link from 'next/link';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CheckoutSuccessPage({
  params,
}: {
  params: { orderId: string };
}) {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CircleCheck className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="mt-4 text-2xl">
            Thank you for your order!
          </CardTitle>
          <CardDescription>
            Your order has been placed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Your master order number is:
            </p>
            <p className="font-mono text-lg font-medium bg-muted py-2 px-4 rounded-md inline-block">
              {params.orderId}
            </p>
            <p className="text-sm text-muted-foreground">
              You will receive an email confirmation shortly with your order
              details. You can also view your order status in your account.
            </p>
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/account/orders">View My Orders</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
