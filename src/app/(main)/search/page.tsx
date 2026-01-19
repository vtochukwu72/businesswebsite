'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, Suspense } from 'react';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/products/product-card';
import { products as staticProducts } from '@/lib/static-data';

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  
  const products = useMemo(() => {
    if (!q) return [];
    return staticProducts.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  }, [q]);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">
        {q ? `${products.length} results for "${q}"` : 'Please enter a search term'}
      </h1>
      
      {q ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please enter a search term in the header to find products.</p>
        </div>
      )}

      {products?.length === 0 && q && (
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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
