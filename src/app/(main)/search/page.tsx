'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, Suspense, useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/products/product-card';
import { getProducts } from '@/services/product-service';
import { Skeleton } from '@/components/ui/skeleton';

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


function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const fetchedProducts = await getProducts();
      setAllProducts(fetchedProducts);
      setLoading(false);
    }
    fetchProducts();
  }, []);
  
  const filteredProducts = useMemo(() => {
    if (!q) return [];
    const lowerCaseQuery = q.toLowerCase();
    return allProducts.filter(p => 
        p.name.toLowerCase().includes(lowerCaseQuery) ||
        p.description.toLowerCase().includes(lowerCaseQuery) ||
        p.category.toLowerCase().includes(lowerCaseQuery) ||
        p.brand.toLowerCase().includes(lowerCaseQuery)
    );
  }, [q, allProducts]);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">
        {loading && q
          ? `Searching for "${q}"...`
          : q
          ? `${filteredProducts.length} results for "${q}"`
          : 'Please enter a search term'}
      </h1>
      
      {q ? (
        loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">No products found</h2>
            <p className="text-muted-foreground mt-2">
              We couldn&apos;t find any products matching your search for "{q}".
            </p>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please enter a search term in the header to find products.</p>
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
