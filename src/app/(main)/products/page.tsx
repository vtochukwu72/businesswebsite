'use client';
import { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '@/components/products/product-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductListingPage() {
  const firestore = useFirestore();
  const [isClient, setIsClient] = useState(false);

  const [filters, setFilters] = useState({
    categories: [] as string[],
    price: null as number | null,
    rating: 0,
  });
  const [sortOption, setSortOption] = useState('featured');

  const productsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'products'), where('isActive', '==', true))
        : null,
    [firestore]
  );
  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  const { categories, minPrice, maxPrice } = useMemo(() => {
    if (!products) {
      return { categories: [], minPrice: 0, maxPrice: 10000 };
    }
    const uniqueCategories = [...new Set(products.map((p) => p.category))];
    const prices = products.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { categories: uniqueCategories, minPrice: min, maxPrice: max };
  }, [products]);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (maxPrice > 0 && filters.price === null) {
      setFilters(f => ({ ...f, price: maxPrice }));
    }
  }, [maxPrice, filters.price]);


  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handlePriceChange = (value: number[]) => {
    setFilters((prev) => ({ ...prev, price: value[0] }));
  };
  
  const handleRatingChange = (rating: number) => {
    setFilters((prev) => ({
      ...prev,
      rating: prev.rating === rating ? 0 : rating,
    }));
  };


  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products.filter((product) => {
      const categoryMatch =
        filters.categories.length === 0 ||
        filters.categories.includes(product.category);
      const priceMatch = filters.price === null || product.price <= filters.price;
      const ratingMatch = product.ratings.average >= filters.rating;
      return categoryMatch && priceMatch && ratingMatch;
    });

    switch (sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        if (filtered[0]?.createdAt) {
          filtered.sort(
            (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
          );
        }
        break;
      case 'stock-desc':
        filtered.sort((a, b) => b.stockQuantity - a.stockQuantity);
        break;
      case 'stock-asc':
        filtered.sort((a, b) => a.stockQuantity - b.stockQuantity);
        break;
      case 'featured':
      default:
        // You could add a 'isFeatured' flag to your product data
        // For now, let's just sort by rating
        filtered.sort((a, b) => b.ratings.average - a.ratings.average);
        break;
    }

    return filtered;
  }, [products, filters, sortOption]);

  return (
    <div className="container py-12 md:py-16 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-4">Shop All Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Category</h3>
              <div className="space-y-2">
                {isLoading ? (
                  <>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-3/4" />
                  </>
                ) : (
                  categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${category}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={() => handleCategoryChange(category)}
                      />
                      <Label htmlFor={`cat-${category}`} className="capitalize">
                        {category}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
            {isClient && (
              <div>
                <h3 className="font-semibold mb-2">Price Range</h3>
                <Slider
                  value={[filters.price ?? maxPrice]}
                  min={minPrice}
                  max={maxPrice}
                  step={10}
                  onValueChange={handlePriceChange}
                  disabled={isLoading || minPrice === maxPrice}
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>₦{minPrice.toFixed(2)}</span>
                  <span>₦{filters.price?.toFixed(2) ?? maxPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
            <div>
              <h3 className="font-semibold mb-2">Rating</h3>
               <div className="space-y-2">
                {[4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rate-${rating}`}
                      checked={filters.rating === rating}
                      onCheckedChange={() => handleRatingChange(rating)}
                    />
                    <Label htmlFor={`rate-${rating}`}>{rating} stars & up</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
        <main className="md:col-span-3">
          <div className="flex justify-between items-center mb-4">
             <div className="text-muted-foreground">
              {filteredAndSortedProducts.length} products
            </div>
            {isClient && (
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="stock-desc">Stock: High to Low</SelectItem>
                  <SelectItem value="stock-asc">Stock: Low to High</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading &&
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              ))}
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
           {!isLoading && filteredAndSortedProducts.length === 0 && (
            <div className="text-center py-20 col-span-full">
              <h2 className="text-xl font-semibold">No products found</h2>
              <p className="text-muted-foreground mt-2">
                Try adjusting your filters to find what you're looking for.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
