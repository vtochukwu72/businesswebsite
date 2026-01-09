'use client';

import { useSearchParams } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/products/product-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !q) return null;
    
    // This is a basic search. For production, a dedicated search service
    // like Algolia or Typesense integrated with Firestore is recommended.
    return query(
      collection(firestore, 'products'),
      where('isActive', '==', true),
      orderBy('name'),
      where('name', '>=', q),
      where('name', '<=', q + '\uf8ff')
    );
  }, [firestore, q]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  return (
    <div className="container py-8">
      {isLoading ? (
         <h1 className="text-3xl font-bold mb-6">Searching for &quot;{q}&quot;...</h1>
      ) : (
         <h1 className="text-3xl font-bold mb-6">
          {products?.length || 0} results for &quot;{q}&quot;
        </h1>
      )}
      
      {q ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading &&
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            ))}
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please enter a search term.</p>
        </div>
      )}

      {!isLoading && products?.length === 0 && q && (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">No products found</h2>
          <p className="text-muted-foreground mt-2">
            We couldn&apos;t find any products matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
