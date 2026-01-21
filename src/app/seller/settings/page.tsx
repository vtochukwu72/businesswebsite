'use client';

import { useActionState, useEffect, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { updateVendorSettings } from './actions';
import type { Vendor } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, CheckCircle, XCircle } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? 'Saving...' : 'Save Settings'}
    </Button>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export default function SellerSettingsPage() {
  const { user, vendorData, loading } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    nin: '',
    businessName: '',
    accountNumber: '',
    bankName: '',
  });

  const [state, formAction] = useActionState(updateVendorSettings, {
    success: false,
    errors: {},
    message: '',
  });

  useEffect(() => {
    if (vendorData) {
      setFormData({
          storeName: vendorData.storeName || '',
          storeDescription: vendorData.storeDescription || '',
          nin: vendorData.nin || '',
          businessName: vendorData.payoutDetails?.businessName || '',
          accountNumber: vendorData.payoutDetails?.accountNumber || '',
          bankName: vendorData.payoutDetails?.bankName || '',
      });
    }
  }, [vendorData]);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: state.message,
      });
    } else if (state.message) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: state.message,
      });
    }
  }, [state, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const getStatusAlert = (status: Vendor['status']) => {
    switch (status) {
        case 'pending':
            return (
                <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                    <Info className="h-4 w-4 !text-yellow-800" />
                    <AlertTitle>Account Pending</AlertTitle>
                    <AlertDescription>
                        Your account is under review. Please ensure all details are filled out correctly. You will be notified once an administrator approves your account.
                    </AlertDescription>
                </Alert>
            );
        case 'approved':
             return (
                <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                    <CheckCircle className="h-4 w-4 !text-green-800" />
                    <AlertTitle>Account Approved</AlertTitle>
                    <AlertDescription>
                        Congratulations! Your account is approved. You can now create and manage your product listings from the "Products" tab.
                    </AlertDescription>
                </Alert>
            );
        case 'suspended':
             return (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Account Suspended</AlertTitle>
                    <AlertDescription>
                        Your account has been suspended. You cannot list products or receive payouts. Please contact support for more information.
                    </AlertDescription>
                </Alert>
            );
        default:
            return null;
    }
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Vendor Settings</CardTitle>
          <CardDescription>
            Manage your store details and payment information. Your details must
            be complete and approved by an admin before you can list products.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SettingsSkeleton />
          ) : !vendorData ? (
            <p className="text-muted-foreground">Could not load vendor data. Please ensure your vendor profile is set up.</p>
          ) : (
            <form action={formAction} className="space-y-8">
              {getStatusAlert(vendorData.status)}

              <input type="hidden" name="vendorId" value={user!.uid} />
              
              <div className="space-y-4">
                 <h3 className="text-lg font-medium">Store Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input id="storeName" name="storeName" value={formData.storeName} onChange={handleInputChange} />
                     {state.errors?.storeName && (
                        <p className="text-sm text-destructive">{state.errors.storeName.join(', ')}</p>
                    )}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="storeDescription">Store Description</Label>
                    <Textarea id="storeDescription" name="storeDescription" value={formData.storeDescription} onChange={handleInputChange} />
                  </div>
              </div>

               <div className="space-y-4">
                 <h3 className="text-lg font-medium">Verification Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="nin">National Identification Number (NIN)</Label>
                    <Input id="nin" name="nin" value={formData.nin} onChange={handleInputChange} />
                     {state.errors?.nin && (
                        <p className="text-sm text-destructive">{state.errors.nin.join(', ')}</p>
                    )}
                  </div>
              </div>

               <div className="space-y-4">
                 <h3 className="text-lg font-medium">Payout Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="businessName">Account Name</Label>
                        <Input id="businessName" name="businessName" value={formData.businessName} onChange={handleInputChange} />
                        {state.errors?.businessName && (
                            <p className="text-sm text-destructive">{state.errors.businessName.join(', ')}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input id="bankName" name="bankName" value={formData.bankName} onChange={handleInputChange} />
                         {state.errors?.bankName && (
                            <p className="text-sm text-destructive">{state.errors.bankName.join(', ')}</p>
                        )}
                    </div>
                 </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input id="accountNumber" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} />
                     {state.errors?.accountNumber && (
                        <p className="text-sm text-destructive">{state.errors.accountNumber.join(', ')}</p>
                    )}
                  </div>
              </div>
              
              <SubmitButton />
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
