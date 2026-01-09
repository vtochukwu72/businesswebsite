'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
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
import { addProduct } from '../actions';
import { useUser } from '@/firebase';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save Product'}</Button>;
}

export default function NewProductPage() {
  const { user } = useUser();
  const addProductWithUserId = addProduct.bind(null, user?.uid ?? '');

  const [state, formAction] = useActionState(addProductWithUserId, {
    errors: {},
    success: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/seller/products" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
          <CardDescription>Fill in the details below to add a new product to your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" name="name" placeholder="e.g. Wireless Headphones" />
                {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name.join(', ')}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" name="price" type="number" step="0.01" placeholder="e.g. 99.99" />
                 {state.errors?.price && <p className="text-sm text-destructive">{state.errors.price.join(', ')}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Describe your product..." />
              {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description.join(', ')}</p>}
            </div>
             <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" placeholder="e.g. Electronics" />
                 {state.errors?.category && <p className="text-sm text-destructive">{state.errors.category.join(', ')}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" name="brand" placeholder="e.g. Sony" />
                 {state.errors?.brand && <p className="text-sm text-destructive">{state.errors.brand.join(', ')}</p>}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity</Label>
                <Input id="stockQuantity" name="stockQuantity" type="number" placeholder="e.g. 100" />
                 {state.errors?.stockQuantity && <p className="text-sm text-destructive">{state.errors.stockQuantity.join(', ')}</p>}
              </div>
               <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" placeholder="e.g. WH-1000XM5" />
                 {state.errors?.sku && <p className="text-sm text-destructive">{state.errors.sku.join(', ')}</p>}
              </div>
            </div>
             {/* TODO: Add image upload */}
            <div className="flex justify-end gap-4">
               <Button variant="outline" asChild>
                <Link href="/seller/products">Cancel</Link>
              </Button>
              <SubmitButton />
            </div>
             {state.errors?._form && <p className="text-sm text-destructive">{state.errors._form.join(', ')}</p>}
             {state.success && <p className="text-sm text-green-600">Product added successfully!</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
