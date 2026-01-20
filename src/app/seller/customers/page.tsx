'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function SellerCustomersPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>
            A list of customers who have purchased from you.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="text-center py-20 border-dashed border-2 rounded-lg">
            <Users className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-6 text-xl font-semibold">No customers yet</h2>
            <p className="mt-2 text-muted-foreground">
              When users purchase your products, their details will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
