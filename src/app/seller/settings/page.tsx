'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Vendor } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function SellerSettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const vendorRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'vendors', user.uid) : null),
    [firestore, user]
  );
  const { data: vendor, isLoading } = useDoc<Vendor>(vendorRef);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Settings</CardTitle>
        <CardDescription>
          Manage your store's information and settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        ) : (
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                name="storeName"
                defaultValue={vendor?.storeName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeDescription">Store Description</Label>
              <Textarea
                id="storeDescription"
                name="storeDescription"
                defaultValue={vendor?.storeDescription}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="storeContactEmail">Contact Email</Label>
              <Input
                id="storeContactEmail"
                name="email"
                type="email"
                defaultValue={vendor?.email}
              />
            </div>
              <div className="space-y-2">
              <Label htmlFor="storeContactPhone">Contact Phone</Label>
              <Input
                id="storeContactPhone"
                name="phone"
                type="tel"
                defaultValue={vendor?.phone}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
         {!isLoading && !vendor && (
           <div className="py-12 text-center text-muted-foreground">
            <h3 className="text-lg font-semibold">Vendor profile not found.</h3>
            <p>Please complete your vendor registration to access store settings.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
