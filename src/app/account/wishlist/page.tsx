'use client';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Wishlist, Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/products/product-card';
import Link from 'next/link';

type EnrichedWishlistItem = {
  productId: string;
  productDetails?: Product;
};

export default function WishlistPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [enrichedItems, setEnrichedItems] = useState<EnrichedWishlistItem[]>(
    []
  );
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  const wishlistRef = useMemoFirebase(
    () =>
      firestore && user
        ? doc(firestore, 'users', user.uid, 'wishlists', 'default')
        : null,
    [firestore, user]
  );
  const { data: wishlist, isLoading: isWishlistLoading } =
    useDoc<Wishlist>(wishlistRef);

  useEffect(() => {
    if (wishlist?.items && firestore) {
      setIsLoadingDetails(true);
      const fetchProductDetails = async () => {
        if (!wishlist.items) {
          setEnrichedItems([]);
          setIsLoadingDetails(false);
          return;
        }
        const itemsWithDetails = await Promise.all(
          wishlist.items.map(async (item) => {
            const productRef = doc(firestore, 'products', item.productId);
            const productSnap = await getDoc(productRef);
            return {
              productId: item.productId,
              productDetails: productSnap.exists()
                ? { ...(productSnap.data() as Product), id: productSnap.id }
                : undefined,
            };
          })
        );
        setEnrichedItems(itemsWithDetails);
        setIsLoadingDetails(false);
      };
      fetchProductDetails();
    } else if (!isWishlistLoading) {
      setEnrichedItems([]);
      setIsLoadingDetails(false);
    }
  }, [wishlist, firestore, isWishlistLoading]);

  const isLoading = isWishlistLoading || isLoadingDetails;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          ))}
        </div>
      ) : enrichedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrichedItems.map(
            (item) =>
              item.productDetails && (
                <ProductCard
                  key={item.productId}
                  product={item.productDetails as any}
                />
              )
          )}
        </div>
      ) : (
        <div className="text-center py-20 border-dashed border-2 rounded-lg">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-6 text-xl font-semibold">Your wishlist is empty</h2>
          <p className="mt-2 text-muted-foreground">
            Explore products and save your favorites to view them here later.
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
