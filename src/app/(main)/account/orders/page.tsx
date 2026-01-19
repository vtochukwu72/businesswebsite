'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function OrdersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            View and track your orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
