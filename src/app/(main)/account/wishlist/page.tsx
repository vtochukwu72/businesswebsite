'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { getProduct } from '@/services/product-service';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/products/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function ProductSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[250px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
  )
}

export default function WishlistPage() {
  const { user, userData } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlistProducts() {
      if (userData && userData.wishlist && userData.wishlist.length > 0) {
        setLoading(true);
        const productPromises = userData.wishlist.map((productId: string) => getProduct(productId));
        const products = await Promise.all(productPromises);
        setWishlistProducts(products.filter((p): p is Product => p !== null));
        setLoading(false);
      } else {
        setLoading(false);
        setWishlistProducts([]);
      }
    }

    if (user) {
        fetchWishlistProducts();
    } else {
        setLoading(false);
    }
  }, [user, userData]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Wishlist</h1>
      {loading ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
        </div>
      ) : wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-dashed border-2 rounded-lg">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-6 text-xl font-semibold">Your wishlist is empty</h2>
          <p className="mt-2 text-muted-foreground">
            Add your favorite items to your wishlist to keep track of them.
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">Explore Products</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
