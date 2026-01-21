'use client';
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { Vendor } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Eye } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

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

  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    if (!user && !authLoading) {
        setDataLoading(false);
        return;
    }
    if (!user) return;


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

  const handleViewDetails = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    setDetailsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDetailsDialogOpen(open);
    if (!open) {
        setSelectedVendorId(null);
    }
  }

  const selectedVendor = selectedVendorId ? vendors.find(v => v.id === selectedVendorId) : null;
  
  const isLoading = authLoading || dataLoading;

  return (
    <>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Vendors</CardTitle>
            <CardDescription>
              Manage vendor accounts and their details. Data is updated
              in real-time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Email</TableHead>
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
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                             <DropdownMenuItem
                              onSelect={() => handleViewDetails(vendor.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No vendors found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      
        <Dialog open={detailsDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-[600px]">
            {!selectedVendor ? (
                 <DialogHeader>
                    <DialogTitle>Loading...</DialogTitle>
                    <div className="py-4">
                        <Skeleton className="h-4 w-1/2 mb-4"/>
                        <Skeleton className="h-20 w-full"/>
                    </div>
                </DialogHeader>
            ) : (
                <>
                    <DialogHeader>
                    <DialogTitle>{selectedVendor.storeName}</DialogTitle>
                    <DialogDescription>
                        Live details for this vendor. Last updated: {selectedVendor.updatedAt ? new Date(selectedVendor.updatedAt.seconds * 1000).toLocaleString() : 'N/A'}
                    </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-6 text-sm">
                        
                        {/* Store Information */}
                        <div>
                            <h3 className="text-lg font-medium mb-2">Store Information</h3>
                            <Separator />
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                                <Label className="text-muted-foreground">Store Name</Label>
                                <div className="md:col-span-2 font-semibold">{selectedVendor.storeName}</div>
                                
                                <Label className="text-muted-foreground">Email</Label>
                                <div className="md:col-span-2">{selectedVendor.email}</div>

                                <Label className="text-muted-foreground">Phone</Label>
                                <div className="md:col-span-2">{selectedVendor.phone || 'N/A'}</div>

                                <Label className="text-muted-foreground">Address</Label>
                                <div className="md:col-span-2">{selectedVendor.address || 'N/A'}</div>

                                <Label className="text-muted-foreground pt-1">Description</Label>
                                <div className="md:col-span-2 whitespace-pre-wrap">{selectedVendor.storeDescription || 'N/A'}</div>
                            </div>
                        </div>

                        {/* Verification Details */}
                        <div>
                            <h3 className="text-lg font-medium mb-2">Verification</h3>
                            <Separator />
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                                <Label className="text-muted-foreground">NIN</Label>
                                <div className="md:col-span-2 font-mono">{selectedVendor.nin || 'Not Provided'}</div>
                            </div>
                        </div>

                        {/* Payout Details */}
                        <div>
                            <h3 className="text-lg font-medium mb-2">Payout Details</h3>
                            <Separator />
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                                <Label className="text-muted-foreground">Account Name</Label>
                                <div className="md:col-span-2">{selectedVendor.payoutDetails?.businessName || 'Not Provided'}</div>

                                <Label className="text-muted-foreground">Bank Name</Label>
                                <div className="md:col-span-2">{selectedVendor.payoutDetails?.bankName || 'Not Provided'}</div>
                                
                                <Label className="text-muted-foreground">Account Number</Label>
                                <div className="md:col-span-2 font-mono">{selectedVendor.payoutDetails?.accountNumber || 'Not Provided'}</div>
                            </div>
                        </div>

                    </div>
                    <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button">Close</Button>
                    </DialogClose>
                    </DialogFooter>
                </>
            )}
          </DialogContent>
        </Dialog>
    </>
  );
}
