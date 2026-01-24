'use client';
import { useEffect, useState, useMemo, useTransition } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/auth-context';
import type { Review, Product } from '@/lib/types';
import { getProductsBySeller } from '@/services/product-service';

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { updateReviewStatus } from './actions';
import { serializeFirestoreData } from '@/lib/utils';

function ReviewRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
    </TableRow>
  );
}

export default function SellerReviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const loading = authLoading || dataLoading;

  useEffect(() => {
    if (!user) {
        setDataLoading(false);
        return;
    }
    setDataLoading(true);

    async function fetchProductsAndReviews() {
        // 1. Fetch vendor's products
        const sellerProducts = await getProductsBySeller(user.uid);
        setProducts(sellerProducts);
        const productIds = sellerProducts.map(p => p.id);

        if (productIds.length === 0) {
            setDataLoading(false);
            return;
        }

        // 2. Subscribe to reviews for those products
        // Firestore 'in' query has a limit of 30 items. Chunking is necessary for >30 products.
        const productChunks: string[][] = [];
        for (let i = 0; i < productIds.length; i += 30) {
            productChunks.push(productIds.slice(i, i+30));
        }

        const unsubscribes = productChunks.map(chunk => {
            const q = query(collection(db, 'reviews'), where('productId', 'in', chunk));
            return onSnapshot(q, (snapshot) => {
                const fetchedReviews: Review[] = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...serializeFirestoreData(data),
                    } as Review;
                });
                
                // Update state by combining new reviews with existing ones from other chunks
                setReviews(currentReviews => {
                    const otherReviews = currentReviews.filter(r => !chunk.includes(r.productId));
                    return [...otherReviews, ...fetchedReviews];
                });
                setDataLoading(false); // Consider loading complete after first fetch
            }, (error) => {
                console.error("Error fetching reviews:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not load reviews."});
                setDataLoading(false);
            });
        });
        
        return () => unsubscribes.forEach(unsub => unsub());
    }
    
    fetchProductsAndReviews();
    
  }, [user, toast]);

  const productMap = useMemo(() => {
    return new Map(products.map(p => [p.id, p.name]));
  }, [products]);

  const handleStatusUpdate = (review: Review, status: 'approved' | 'rejected') => {
    if (!user) return;
    startTransition(async () => {
        const result = await updateReviewStatus(review.id, review.productId, user.uid, status);
        if (result.success) {
            toast({ title: "Success", description: result.message });
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
    });
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };


  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Product Reviews</CardTitle>
          <CardDescription>
            Manage and respond to reviews for your products.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  <ReviewRowSkeleton />
                  <ReviewRowSkeleton />
                </>
              ) : reviews.length > 0 ? (
                reviews.map(review => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">{review.userName}</TableCell>
                    <TableCell>{productMap.get(review.productId) || review.productId}</TableCell>
                    <TableCell>
                      <div className="font-medium">{review.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">{review.comment}</div>
                    </TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(review.status)} className="capitalize">{review.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</TableCell>
                    <TableCell>
                      {review.status === 'pending' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleStatusUpdate(review, 'approved')} disabled={isPending}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            </DropdownMenuItem>
                             <DropdownMenuItem onSelect={() => handleStatusUpdate(review, 'rejected')} disabled={isPending} className="text-destructive">
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No reviews found for your products yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
