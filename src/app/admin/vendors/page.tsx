
'use client';
import { useEffect, useState, useMemo, useTransition } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { reviewVendor } from './actions';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function VendorRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-24" />
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
  const [isPending, startTransition] = useTransition();

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const [filter, setFilter] = useState('all');
  const [riskScore, setRiskScore] = useState(5);
  const [justification, setJustification] = useState('');

  const isLoading = authLoading || dataLoading;

  useEffect(() => {
    if (authLoading || !user) {
      if (!authLoading) setDataLoading(false);
      return;
    }

    setDataLoading(true);
    const vendorsCollection = collection(db, 'vendors');
    const q = query(vendorsCollection);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedVendors: Vendor[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          // Manually convert any Timestamps to a serializable format (ISO string)
          if (data.createdAt && data.createdAt.toDate) {
            data.createdAt = data.createdAt.toDate().toISOString();
          }
          if (data.updatedAt && data.updatedAt.toDate) {
            data.updatedAt = data.updatedAt.toDate().toISOString();
          }
          if (
            data.compliance &&
            data.compliance.reviewedAt &&
            data.compliance.reviewedAt.toDate
          ) {
            data.compliance.reviewedAt = data.compliance.reviewedAt
              .toDate()
              .toISOString();
          }
          return { id: doc.id, ...data } as Vendor;
        });

        setVendors(fetchedVendors);
        setDataLoading(false);
      },
      (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'vendors',
          operation: 'list',
        }, error);
        errorEmitter.emit('permission-error', permissionError);

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
  
  const filteredVendors = useMemo(() => {
    if (filter === 'all') return vendors;
    return vendors.filter(vendor => vendor.status === filter);
  }, [vendors, filter]);

  const handleViewDetailsClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setDetailsDialogOpen(true);
  };
  
  const handleReviewClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setRiskScore(vendor.compliance?.riskScore || 5);
    setJustification(vendor.compliance?.justification || '');
    setReviewDialogOpen(true);
  };
  
  const handleReviewSubmit = (decision: 'approved' | 'rejected') => {
    if (!selectedVendor || !user) return;
    
    startTransition(async () => {
      const result = await reviewVendor({
        vendorId: selectedVendor.id,
        decision,
        riskScore,
        justification,
        adminUserId: user.uid,
      });

      if (result.success) {
        toast({ title: 'Success', description: result.message });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
      setReviewDialogOpen(false);
    });
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Tabs defaultValue="all" onValueChange={setFilter}>
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value={filter}>
            <Card>
              <CardHeader>
                <CardTitle>Vendor Applications</CardTitle>
                <CardDescription>
                  Review and manage vendor applications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Store Name</TableHead>
                      <TableHead>Status</TableHead>
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
                    ) : filteredVendors.length > 0 ? (
                      filteredVendors.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">
                            {vendor.storeName}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(vendor.status)} className="capitalize">
                              {vendor.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{vendor.email}</TableCell>
                          <TableCell>{vendor.phone || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                             <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button aria-haspopup="true" size="icon" variant="ghost">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Toggle menu</span>
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onSelect={() => handleViewDetailsClick(vendor)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                  </DropdownMenuItem>
                                   <DropdownMenuItem onSelect={() => handleReviewClick(vendor)}>
                                    Review Application
                                  </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No vendors found with status &quot;{filter}&quot;.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* View Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          {!selectedVendor ? (
            <DialogHeader>
              <DialogTitle>Loading Vendor...</DialogTitle>
              <div className="py-4">
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full" />
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
                    </div>
                  </div>
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
                </div>
                 <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Compliance Review</h3>
                    <Separator />
                     {selectedVendor.compliance?.reviewedAt ? (
                        <div className="mt-4 space-y-2 text-sm">
                          <div className="grid grid-cols-3 gap-2">
                            <p className="text-muted-foreground">Risk Score:</p>
                            <p className="col-span-2 font-medium">{selectedVendor.compliance.riskScore}/10</p>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <p className="text-muted-foreground">Review Date:</p>
                            <p className="col-span-2">{new Date(selectedVendor.compliance.reviewedAt).toLocaleString()}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 items-start">
                            <p className="text-muted-foreground pt-1">Justification:</p>
                            <p className="col-span-2 whitespace-pre-wrap">{selectedVendor.compliance.justification}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-4">No review has been completed yet.</p>
                      )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
       {/* Review Dialog */}
      <AlertDialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Review Vendor: {selectedVendor?.storeName}</AlertDialogTitle>
              <AlertDialogDescription>
                Assess the vendor&apos;s application and provide a risk score with justification.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="riskScore">Risk Score: {riskScore}/10</Label>
                <Slider
                  id="riskScore"
                  min={1}
                  max={10}
                  step={1}
                  value={[riskScore]}
                  onValueChange={(value) => setRiskScore(value[0])}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="justification">Justification</Label>
                <Textarea
                  id="justification"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Provide a bulleted justification for your decision..."
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
               <Button variant="destructive" disabled={isPending} onClick={() => handleReviewSubmit('rejected')}>
                 <XCircle className="mr-2 h-4 w-4"/>
                {isPending ? 'Rejecting...' : 'Reject'}
              </Button>
              <Button disabled={isPending} onClick={() => handleReviewSubmit('approved')}>
                <CheckCircle className="mr-2 h-4 w-4"/>
                {isPending ? 'Approving...' : 'Approve'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
