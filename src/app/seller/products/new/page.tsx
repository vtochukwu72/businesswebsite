'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { addProduct } from '../actions';
import { useToast } from '@/hooks/use-toast';

// Hardcoded categories for simplicity. In a real app, this would come from the database.
const categories = ['Electronics', 'Fashion', 'Groceries', 'Home Goods', 'Books'];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Publishing Product...' : 'Publish Product'}
    </Button>
  );
}

export default function AddProductPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [state, formAction] = useActionState(addProduct, {
    success: false,
    errors: {},
    message: undefined
  });

  useEffect(() => {
    // A redirect in the action handles success, so we only need to handle errors here.
    if (state.success === false && state.message) {
      toast({
        variant: 'destructive',
        title: 'Error creating product',
        description: state.message,
      });
    }
  }, [state, toast]);

  if (!user) {
    // This should be handled by the layout, but it's a good fallback.
    return <div>Loading...</div>
  }

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <form action={formAction}>
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="icon" className="h-7 w-7" asChild>
             <Link href="/seller/products">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Add New Product
          </h1>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
             <Button type="button" variant="outline" size="sm" onClick={() => router.push('/seller/products')}>
                Discard
              </Button>
            <SubmitButton />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Fill out the form to add a new product to your store. The product will be live on the marketplace immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <input type="hidden" name="sellerId" value={user.uid} />

              <div className="grid gap-3">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  className="w-full"
                  placeholder="e.g. Premium Wireless Headphones"
                />
                {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name.join(', ')}</p>}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Provide a detailed description of your product..."
                />
                {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description.join(', ')}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-3">
                    <Label htmlFor="price">Price (NGN)</Label>
                    <Input id="price" name="price" type="number" placeholder="e.g. 25000" />
                    {state.errors?.price && <p className="text-sm text-destructive">{state.errors.price.join(', ')}</p>}
                </div>
                 <div className="grid gap-3">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                     {state.errors?.category && <p className="text-sm text-destructive">{state.errors.category.join(', ')}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="grid gap-3">
                    <Label htmlFor="brand">Brand</Label>
                    <Input id="brand" name="brand" type="text" placeholder="e.g. SoundWave" />
                    {state.errors?.brand && <p className="text-sm text-destructive">{state.errors.brand.join(', ')}</p>}
                </div>
                 <div className="grid gap-3">
                    <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                    <Input id="sku" name="sku" type="text" placeholder="e.g. SW-WH1000" />
                     {state.errors?.sku && <p className="text-sm text-destructive">{state.errors.sku.join(', ')}</p>}
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="stockQuantity">Stock Quantity</Label>
                <Input id="stockQuantity" name="stockQuantity" type="number" placeholder="e.g. 150" />
                {state.errors?.stockQuantity && <p className="text-sm text-destructive">{state.errors.stockQuantity.join(', ')}</p>}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="images">Image URLs</Label>
                <Textarea
                  id="images"
                  name="images"
                  placeholder="Enter one image URL per line. The first one will be the main image."
                />
                <p className="text-xs text-muted-foreground">For now, please use placeholder image URLs from a service like picsum.photos.</p>
                {state.errors?.images && <p className="text-sm text-destructive">{state.errors.images.join(', ')}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
         <div className="mt-4 flex items-center justify-end gap-2 md:hidden">
            <Button type="button" variant="outline" size="sm" onClick={() => router.push('/seller/products')}>
                Discard
              </Button>
            <SubmitButton />
          </div>
      </form>
    </main>
  );
}
