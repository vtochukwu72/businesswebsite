'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { saveUserAddress } from '../actions';
import { Skeleton } from '@/components/ui/skeleton';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Address'}
    </Button>
  );
}

function AddressSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
        </div>
    )
}

export default function AddressesPage() {
  const { user, userData, loading } = useAuth();
  const { toast } = useToast();

  const [state, formAction] = useActionState(saveUserAddress, {
    success: false,
    errors: {},
    message: ''
  });

  useEffect(() => {
    if(state.success) {
      toast({
        title: 'Address Saved',
        description: 'Your shipping address has been updated.',
      });
    } else if (state.message) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Shipping Address</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Your Address</CardTitle>
          <CardDescription>
            Update your primary shipping address below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <AddressSkeleton />
          ) : user ? (
            <form action={formAction} className="space-y-6">
                <input type="hidden" name="userId" value={user.uid} />
                
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                    id="fullName"
                    name="fullName"
                    defaultValue={userData?.shippingAddress?.fullName || userData?.displayName || ''}
                    />
                    {state.errors?.fullName && <p className="text-sm text-destructive">{state.errors.fullName.join(', ')}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                    id="street"
                    name="street"
                    defaultValue={userData?.shippingAddress?.street || ''}
                    />
                    {state.errors?.street && <p className="text-sm text-destructive">{state.errors.street.join(', ')}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                        id="city"
                        name="city"
                        defaultValue={userData?.shippingAddress?.city || ''}
                        />
                         {state.errors?.city && <p className="text-sm text-destructive">{state.errors.city.join(', ')}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="state">State / Province</Label>
                        <Input
                        id="state"
                        name="state"
                        defaultValue={userData?.shippingAddress?.state || ''}
                        />
                         {state.errors?.state && <p className="text-sm text-destructive">{state.errors.state.join(', ')}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP / Postal Code</Label>
                        <Input
                        id="zipCode"
                        name="zipCode"
                        defaultValue={userData?.shippingAddress?.zipCode || ''}
                        />
                         {state.errors?.zipCode && <p className="text-sm text-destructive">{state.errors.zipCode.join(', ')}</p>}
                    </div>
                </div>

                 <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                    id="country"
                    name="country"
                    defaultValue={userData?.shippingAddress?.country || ''}
                    />
                    {state.errors?.country && <p className="text-sm text-destructive">{state.errors.country.join(', ')}</p>}
                </div>
                
                <SubmitButton />
            </form>
          ) : (
            <p className="text-muted-foreground">Please log in to manage your address.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    