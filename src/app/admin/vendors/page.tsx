'use client';
import { useEffect, useState, useTransition, useMemo } from 'react';
import { collection, query, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  DropdownMenuSeparator,
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
import { updateVendorStatus } from './actions';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

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
        <Skeleton className="h-6 w-20" />
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
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    // Only fetch data if an authenticated user is present
    if (!user) {
        if (!authLoading) {
            setDataLoading(false);
        }
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

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, authLoading, toast]);
  
  // This effect ensures that the data in the dialog is always live.
  // It listens for changes in the main `vendors` list and updates `selectedVendor`
  // if it's currently open in the dialog.
  useEffect(() => {
    if (selectedVendor) {
      const updatedVendor = vendors.find(v => v.id === selectedVendor.id);
      if (updatedVendor) {
        setSelectedVendor(updatedVendor);
      } else {
        // The vendor was deleted, so close the dialog.
        setDetailsDialogOpen(false);
        setSelectedVendor(null);
      }
    }
  }, [vendors, selectedVendor]);


  const handleStatusChange = (
    vendorId: string,
    status: 'approved' | 'suspended' | 'pending'
  ) => {
    startTransition(async () => {
      const result = await updateVendorStatus(vendorId, status);
      if (result.success) {
        toast({
          title: 'Status Updated',
          description: result.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: result.message,
        });
      }
    });
  };

  const handleViewDetails = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setDetailsDialogOpen(true);
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const isLoading = authLoading || dataLoading;

  return (
    <>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Vendors</CardTitle>
            <CardDescription>
              Manage vendor accounts and their approval status. Data is updated
              in real-time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
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
                        <Badge
                          variant={getBadgeVariant(vendor.status)}
                          className="capitalize"
                        >
                          {vendor.status}
                        </Badge>
                      </TableCell>
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
                              onSelect={() => handleViewDetails(vendor)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(vendor.id, 'approved')
                              }
                              disabled={isPending || vendor.status === 'approved'}
                            >
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(vendor.id, 'suspended')
                              }
                              disabled={
                                isPending || vendor.status === 'suspended'
                              }
                            >
                              Suspend
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(vendor.id, 'pending')
                              }
                              disabled={isPending || vendor.status === 'pending'}
                            >
                              Set to Pending
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {selectedVendor && (
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Vendor Details</DialogTitle>
              <DialogDescription>
                Full profile for{' '}
                <span className="font-semibold">
                  {selectedVendor.storeName}
                </span>
                . Data is live.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6 text-sm">
              <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                <Label className="text-right text-muted-foreground">Store Name</Label>
                <div className="col-span-3 font-semibold">{selectedVendor.storeName}</div>
              </div>
              <div className="grid grid-cols-4 items-start gap-x-4 gap-y-2">
                <Label className="text-right mt-1 text-muted-foreground">Description</Label>
                <div className="col-span-3">
                  {selectedVendor.storeDescription || 'N/A'}
                </div>
              </div>
               <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                <Label className="text-right text-muted-foreground">Status</Label>
                <div className="col-span-3">
                     <Badge
                        variant={getBadgeVariant(selectedVendor.status)}
                        className="capitalize"
                        >
                        {selectedVendor.status}
                    </Badge>
                </div>
              </div>

              <Separator className="my-2" />

               <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                <Label className="text-right text-muted-foreground">Email</Label>
                <div className="col-span-3">{selectedVendor.email}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                <Label className="text-right text-muted-foreground">Phone</Label>
                <div className="col-span-3">{selectedVendor.phone || 'N/A'}</div>
              </div>
              <div className="grid grid-cols-4 items-start gap-x-4 gap-y-2">
                <Label className="text-right mt-1 text-muted-foreground">Address</Label>
                <div className="col-span-3">{selectedVendor.address || 'N/A'}</div>
              </div>

               <Separator className="my-2" />
               <h4 className="font-medium col-span-4 -mb-2">Verification</h4>

               <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                <Label className="text-right text-muted-foreground">NIN</Label>
                <div className="col-span-3 font-mono">{selectedVendor.nin || 'Not Provided'}</div>
              </div>

              <Separator className="my-2" />
              <h4 className="font-medium col-span-4 -mb-2">Payout Details</h4>
              <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                <Label className="text-right text-muted-foreground">Account Name</Label>
                <div className="col-span-3">
                  {selectedVendor.payoutDetails?.businessName || 'Not Provided'}
                </div>
              </div>
               <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                <Label className="text-right text-muted-foreground">Bank Name</Label>
                <div className="col-span-3">
                  {selectedVendor.payoutDetails?.bankName || 'Not Provided'}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
                <Label className="text-right text-muted-foreground">Account No.</Label>
                <div className="col-span-3 font-mono">
                  {selectedVendor.payoutDetails?.accountNumber || 'Not Provided'}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
