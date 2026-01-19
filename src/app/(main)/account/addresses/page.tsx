'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AddressesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Shipping Addresses</h1>
      <Card>
        <CardHeader>
          <CardTitle>Saved Addresses</CardTitle>
          <CardDescription>
            Manage your shipping addresses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No saved addresses</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
