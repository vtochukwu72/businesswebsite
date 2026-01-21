'use client';
import { useEffect, useState, useMemo, useTransition } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { getProductsBySeller } from '@/services/product-service';
import type { Vendor, Product } from '@/lib/types';

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
  DropdownMenuSeparator,
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
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Eye, ShieldCheck, ShieldX } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { reviewVendor } from './actions';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
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
        <Skeleton className="h-6 w-20 rounded-full" />
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
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorProducts, setVendorProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [riskScore, setRiskScore] = useState(5);
  const [justification, setJustification] = useState('');

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

  useEffect(() => {
    if (selectedVendor && reviewDialogOpen) {
      setProductsLoading(true);
      getProductsBySeller(selectedVendor.id)
        .then(setVendorProducts)
        .finally(() => setProductsLoading(false));
      setRiskScore(selectedVendor.compliance?.riskScore || 5);
      setJustification(selectedVendor.compliance?.justification || '');
    }
  }, [selectedVendor, reviewDialogOpen]);
  
  const filteredVendors = useMemo(() => {
    if (filter === 'all') return vendors;
    return vendors.filter(vendor => vendor.status === filter);
  }, [vendors, filter]);

  const handleReviewClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
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
            adminUserId: user.uid
        });
        if (result.success) {
            toast({
                title: 'Review Submitted',
                description: result.message,
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: result.message,
            });
        }
        setReviewDialogOpen(false);
    });
  }

  const getStatusBadgeVariant = (status: Vendor['status']) => {
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
                    <CardTitle>Vendors</CardTitle>
                    <CardDescription>
                    Review vendor applications, manage their status, and view details.
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
                        ) : filteredVendors.length > 0 ? (
                        filteredVendors.map((vendor) => (
                            <TableRow key={vendor.id}>
                            <TableCell className="font-medium">
                                {vendor.storeName}
                            </TableCell>
                            <TableCell>{vendor.email}</TableCell>
                             <TableCell>
                                <Badge variant={getStatusBadgeVariant(vendor.status)} className="capitalize">{vendor.status}</Badge>
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
                                    onSelect={() => handleReviewClick(vendor)}
                                    >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Review Application
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                            No vendors found for this filter.
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

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
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
                          <DialogTitle>Review Application: {selectedVendor.storeName}</DialogTitle>
                          <DialogDescription>
                              Review the vendor's submitted information and product catalog to make a compliance decision.
                          </DialogDescription>
                      </DialogHeader>

                      <div className="grid md:grid-cols-2 gap-6 py-4 overflow-y-auto flex-1 pr-2">
                        {/* Left Side: Vendor Details & Review Form */}
                        <div className="space-y-6">
                             <div>
                                <h3 className="text-lg font-medium mb-2">Compliance Details</h3>
                                <Separator />
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                                    <Label className="text-muted-foreground">Tax ID</Label>
                                    <div className="md:col-span-2 font-mono">{selectedVendor.taxId || 'Not Provided'}</div>
                                    
                                    <Label className="text-muted-foreground">Business License</Label>
                                    <div className="md:col-span-2">
                                        {selectedVendor.businessLicenseUrl ? (
                                            <Link href={selectedVendor.businessLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">View Document</Link>
                                        ) : 'Not Provided'}
                                    </div>
                                    
                                    <Label className="text-muted-foreground pt-1">Seller History</Label>
                                    <div className="md:col-span-2 whitespace-pre-wrap">{selectedVendor.sellerHistory || 'Not Provided'}</div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-medium mb-2">Compliance Review</h3>
                                <Separator />
                                <div className="mt-4 space-y-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="risk-score">Risk Score: {riskScore}</Label>
                                        <p className="text-xs text-muted-foreground">1 = Very Low Risk, 10 = Very High Risk</p>
                                        <Slider
                                            id="risk-score"
                                            min={1}
                                            max={10}
                                            step={1}
                                            value={[riskScore]}
                                            onValueChange={(value) => setRiskScore(value[0])}
                                            disabled={isPending}
                                        />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="justification">Justification / Notes</Label>
                                        <Textarea 
                                            id="justification"
                                            placeholder="Provide a bulleted list or notes for approval or rejection..."
                                            value={justification}
                                            onChange={(e) => setJustification(e.target.value)}
                                            disabled={isPending}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Product Catalog */}
                        <div className="space-y-4">
                             <h3 className="text-lg font-medium">Product Catalog ({vendorProducts.length})</h3>
                             <Separator/>
                             <div className="border rounded-lg max-h-96 overflow-y-auto">
                                 {productsLoading ? (
                                    <div className="p-4 text-sm text-muted-foreground">Loading products...</div>
                                 ) : vendorProducts.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead className="text-right">Price</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {vendorProducts.map(p => (
                                                <TableRow key={p.id}>
                                                    <TableCell className="font-medium">{p.name}</TableCell>
                                                    <TableCell className="text-right">₦{p.price.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                 ) : (
                                     <div className="p-4 text-center text-sm text-muted-foreground">No products found for this vendor.</div>
                                 )}
                             </div>
                        </div>

                      </div>

                      <DialogFooter>
                          <DialogClose asChild><Button type="button" variant="ghost" disabled={isPending}>Cancel</Button></DialogClose>
                          <Button type="button" variant="destructive" onClick={() => handleReviewSubmit('rejected')} disabled={isPending}>
                            <ShieldX className="mr-2 h-4 w-4" />
                            {isPending ? 'Rejecting...' : 'Reject'}
                          </Button>
                          <Button type="button" onClick={() => handleReviewSubmit('approved')} disabled={isPending}>
                             <ShieldCheck className="mr-2 h-4 w-4" />
                             {isPending ? 'Approving...' : 'Approve'}
                          </Button>
                      </DialogFooter>
                  </>
              )}
          </DialogContent>
      </Dialog>
    </>
  );
}

    