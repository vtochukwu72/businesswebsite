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
import { Separator } from '@/components/ui/separator';

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
    phone: '',
    address: '',
    nin: '',
    businessLicenseUrl: '',
    taxId: '',
    sellerHistory: '',
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
          phone: vendorData.phone || '',
          address: vendorData.address || '',
          nin: vendorData.nin || '',
          businessLicenseUrl: vendorData.businessLicenseUrl || '',
          taxId: vendorData.taxId || '',
          sellerHistory: vendorData.sellerHistory || '',
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

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Vendor Settings</CardTitle>
          <CardDescription>
            Manage your store details and compliance information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SettingsSkeleton />
          ) : !vendorData ? (
            <p className="text-muted-foreground">Could not load vendor data. Please ensure your vendor profile is set up.</p>
          ) : (
            <form action={formAction} className="space-y-8">
              <input type="hidden" name="vendorId" value={user!.uid} />
              
              <div className="space-y-4">
                 <h3 className="text-lg font-medium">Store Information</h3>
                 <Separator/>
                  <div className="space-y-2 pt-2">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="phone">Contact Phone</Label>
                        <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="address">Business Address</Label>
                        <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
                      </div>
                  </div>
              </div>

               <div className="space-y-4">
                 <h3 className="text-lg font-medium">Compliance & Verification</h3>
                  <Separator/>
                  <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="nin">National Identification Number (NIN)</Label>
                        <Input id="nin" name="nin" value={formData.nin} onChange={handleInputChange} />
                        {state.errors?.nin && (
                            <p className="text-sm text-destructive">{state.errors.nin.join(', ')}</p>
                        )}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="taxId">Tax ID (Optional)</Label>
                        <Input id="taxId" name="taxId" value={formData.taxId} onChange={handleInputChange} />
                      </div>
                  </div>
                   <div className="space-y-2">
                        <Label htmlFor="businessLicenseUrl">Business License URL (Optional)</Label>
                        <Input id="businessLicenseUrl" name="businessLicenseUrl" value={formData.businessLicenseUrl} onChange={handleInputChange} placeholder="https://example.com/license.pdf"/>
                         {state.errors?.businessLicenseUrl && (
                            <p className="text-sm text-destructive">{state.errors.businessLicenseUrl.join(', ')}</p>
                        )}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="sellerHistory">Past Seller History (Optional)</Label>
                        <Textarea id="sellerHistory" name="sellerHistory" value={formData.sellerHistory} onChange={handleInputChange} placeholder="Briefly describe your previous selling experience..."/>
                    </div>
              </div>

               <div className="space-y-4">
                 <h3 className="text-lg font-medium">Payout Details</h3>
                 <Separator/>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
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

    