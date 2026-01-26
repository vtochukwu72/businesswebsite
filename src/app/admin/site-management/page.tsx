'use client';
import Image from 'next/image';
import { useEffect, useState, useMemo, useTransition, useActionState, useRef } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { toggleFeaturedProduct } from '../products/actions';
import { updateCarouselText } from './actions';
import { serializeFirestoreData } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFormStatus } from 'react-dom';


function ProductRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="hidden sm:table-cell">
        <Skeleton className="aspect-square rounded-md object-cover h-16 w-16" />
      </TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-10 w-24" /></TableCell>
      <TableCell><Skeleton className="h-10 w-24" /></TableCell>
    </TableRow>
  );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
        {pending ? 'Saving...' : 'Save Changes'}
        </Button>
    );
}

export default function SiteManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, startUpdateTransition] = useTransition();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [state, formAction] = useActionState(updateCarouselText, {
    success: false,
    errors: {},
    message: '',
  });

  useEffect(() => {
    if(state.message) {
        if (state.success) {
            toast({ title: 'Success!', description: state.message });
            setIsDialogOpen(false);
        } else {
            toast({ variant: 'destructive', title: 'Update Failed', description: state.message });
        }
    }
  }, [state, toast]);

  useEffect(() => {
    setLoading(true);

    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedProducts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...serializeFirestoreData(doc.data()),
        } as Product));
        setProducts(fetchedProducts);
        setLoading(false);
    }, (error) => {
      const permissionError = new FirestorePermissionError({
        path: 'products',
        operation: 'list'
      }, error);
      errorEmitter.emit('permission-error', permissionError);
      console.error("Error fetching products: ", error);
      toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "Could not load product data for site management."
      });
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [toast]);

  const handleFeaturedToggle = (product: Product) => {
    startUpdateTransition(async () => {
        const result = await toggleFeaturedProduct(product.id, !product.isFeatured);
        if (result.success) {
            toast({
                title: 'Success',
                description: result.message,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: result.message,
            });
        }
    });
  };

  const handleEditText = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  }

  return (
    <>
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Homepage Carousel Management</CardTitle>
          <CardDescription>
            Use the toggles to select which products appear in the homepage carousel. You can also add custom text for each slide.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  Image
                </TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Carousel Content</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  <ProductRowSkeleton />
                  <ProductRowSkeleton />
                  <ProductRowSkeleton />
                </>
              ) : products.length > 0 ? (
                products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={product.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={product.images?.[0] || 'https://placehold.co/64x64'}
                        width="64"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={product.isFeatured || false}
                        onCheckedChange={() => handleFeaturedToggle(product)}
                        disabled={isUpdating}
                        aria-label={`Feature ${product.name}`}
                      />
                    </TableCell>
                    <TableCell>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditText(product)}
                            disabled={!product.isFeatured}
                        >
                            Edit Text
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                  <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>

    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Carousel Text</DialogTitle>
                <DialogDescription>
                    Set a custom headline and description for &quot;{editingProduct?.name}&quot; when it appears in the carousel.
                </DialogDescription>
            </DialogHeader>
            <form action={formAction} className="space-y-4">
                <input type="hidden" name="productId" value={editingProduct?.id || ''} />
                <div className="space-y-2">
                    <Label htmlFor="carouselHeadline">Carousel Headline</Label>
                    <Input 
                        id="carouselHeadline"
                        name="carouselHeadline"
                        defaultValue={editingProduct?.carouselHeadline || ''}
                        placeholder="Leave blank to use product name"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="carouselDescription">Carousel Description</Label>
                    <Textarea
                        id="carouselDescription"
                        name="carouselDescription"
                        defaultValue={editingProduct?.carouselDescription || ''}
                        placeholder="Leave blank to use product description"
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <SubmitButton />
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
    </>
  );
}

    