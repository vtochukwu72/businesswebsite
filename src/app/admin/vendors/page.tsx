
'use client';
import { useEffect, useState, useMemo } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Vendor } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function VendorRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
       <TableCell>
        <Skeleton className="h-8 w-8 ml-auto" />
      </TableCell>
    </TableRow>
  );
}

export default function AdminVendorsPage() {
  const { user, loading: authLoading } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const isLoading = authLoading || dataLoading;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    const vendorsCollection = collection(db, 'vendors');
    const q = query(vendorsCollection);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedVendors: Vendor[] = [];
        querySnapshot.forEach((doc) => {
          fetchedVendors.push({ id: doc.id, ...doc.data() } as Vendor);
        });
        setVendors(fetchedVendors);
        setDataLoading(false);
      },
      (error) => {
        console.error('Error fetching vendors in real-time:', error);
        setDataLoading(false);
        toast({
          variant: 'destructive',
          title: 'Permission Error',
          description:
            'Could not load vendor data. You may not have the required permissions.',
        });
      }
    );

    return () => unsubscribe();
  }, [user, authLoading, toast]);


  const handleViewDetailsClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setDetailsDialogOpen(true);
  };

  return (
    <>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Card>
        <CardHeader>
            <CardTitle>Vendors</CardTitle>
            <CardDescription>
            A list of all registered vendors on the platform.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Store Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                <>
                    <VendorRowSkeleton />
                    <VendorRowSkeleton />
                    <VendorRowSkeleton />
                </>
                ) : vendors.length > 0 ? (
                vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                    <TableCell className="font-medium">
                        {vendor.storeName}
                    </TableCell>
                    <TableCell>{vendor.email}</TableCell>
                    <TableCell>{vendor.phone || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                        <Button
                            aria-haspopup="true"
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetailsClick(vendor)}
                            >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </Button>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                    No vendors found.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
      </main>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
              {!selectedVendor ? (
                  <DialogHeader>
                      <DialogTitle>Loading Vendor...</DialogTitle>
                      <div className="py-4">
                          <Skeleton className="h-4 w-1/2 mb-4"/>
                          <Skeleton className="h-20 w-full"/>
                      </div>
                  </DialogHeader>
              ) : (
                  <>
                      <DialogHeader>
                          <DialogTitle>Vendor Details: {selectedVendor.storeName}</DialogTitle>
                          <DialogDescription>
                              Live details for this vendor.
                          </DialogDescription>
                      </DialogHeader>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 py-4 overflow-y-auto flex-1 pr-2">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium mb-2">Store Information</h3>
                                <Separator />
                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="grid grid-cols-3 gap-2">
                                        <p className="text-muted-foreground">Store Name:</p>
                                        <p className="col-span-2 font-medium">{selectedVendor.storeName}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <p className="text-muted-foreground">Email:</p>
                                        <p className="col-span-2">{selectedVendor.email}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <p className="text-muted-foreground">Phone:</p>
                                        <p className="col-span-2">{selectedVendor.phone || 'Not Provided'}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <p className="text-muted-foreground">Address:</p>
                                        <p className="col-span-2">{selectedVendor.address || 'Not Provided'}</p>
                                    </div>
                                     <div className="grid grid-cols-3 gap-2 items-start">
                                        <p className="text-muted-foreground pt-1">Description:</p>
                                        <p className="col-span-2 whitespace-pre-wrap">{selectedVendor.storeDescription || 'Not Provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                             <div>
                                <h3 className="text-lg font-medium mb-2">Verification Details</h3>
                                <Separator />
                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="grid grid-cols-3 gap-2">
                                        <p className="text-muted-foreground">NIN:</p>
                                        <p className="col-span-2 font-mono">{selectedVendor.nin || 'Not Provided'}</p>
                                    </div>
                                     <div className="grid grid-cols-3 gap-2">
                                        <p className="text-muted-foreground">Tax ID:</p>
                                        <p className="col-span-2 font-mono">{selectedVendor.taxId || 'Not Provided'}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <p className="text-muted-foreground">Business License:</p>
                                        <div className="col-span-2">
                                        {selectedVendor.businessLicenseUrl ? (
                                            <Link href={selectedVendor.businessLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">View Document</Link>
                                        ) : 'Not Provided'}
                                    </div>
                                    </div>
                                </div>
                            </div>

                             <div>
                                <h3 className="text-lg font-medium mb-2">Payout Details</h3>
                                <Separator />
                                <div className="mt-4 space-y-2 text-sm">
                                    <div className="grid grid-cols-3 gap-2">
                                        <p className="text-muted-foreground">Account Name:</p>
                                        <p className="col-span-2 font-medium">{selectedVendor.payoutDetails?.businessName || 'Not Provided'}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <p className="text-muted-foreground">Bank Name:</p>
                                        <p className="col-span-2">{selectedVendor.payoutDetails?.bankName || 'Not Provided'}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <p className="text-muted-foreground">Account No:</p>
                                        <p className="col-span-2 font-mono">{selectedVendor.payoutDetails?.accountNumber || 'Not Provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                      </div>
                  </>
              )}
          </DialogContent>
      </Dialog>
    </>
  );
}
