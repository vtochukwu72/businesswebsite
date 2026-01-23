'use client';

import { useState, useEffect, useRef } from 'react';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { getProductsByIds } from '@/services/product-service';
import type { Product } from '@/lib/types';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ProductCard } from './product-card';
import { Skeleton } from '@/components/ui/skeleton';
import Autoplay from 'embla-carousel-autoplay';

function ProductSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[250px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
  );
}

export function RecentlyViewedProducts() {
  const { getRecentlyViewed } = useRecentlyViewed();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));
  
  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      const productIds = getRecentlyViewed();
      if (productIds.length > 0) {
        setLoading(true);
        const fetchedProducts = await getProductsByIds(productIds);
        setProducts(fetchedProducts);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, [getRecentlyViewed]);

  if (products.length === 0) {
    return null; // Don't render the section if there's nothing to show
  }

  return (
    <section className="py-12 md:py-20 px-4 md:px-8 lg:px-12">
      <div className="container">
        <h2 className="mb-8 text-center text-3xl font-bold">
          Recently Viewed
        </h2>
        <Carousel
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          opts={{
            align: 'start',
            loop: products.length > 3,
          }}
          className="mx-auto w-full max-w-sm md:max-w-3xl lg:max-w-5xl"
        >
          <CarouselContent>
            {loading ?
              [...Array(4)].map((_, i) => (
                <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                  <ProductSkeleton />
                </CarouselItem>
              )) :
              products.map((product) => (
                <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3">
                  <ProductCard product={product} />
                </CarouselItem>
              ))
            }
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
