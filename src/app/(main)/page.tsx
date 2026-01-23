
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Star, Truck, Shield, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ProductCard } from '@/components/products/product-card';
import type { Product } from '@/lib/types';
import { NewsletterForm } from '@/components/newsletter-form';
import { getProducts } from '@/services/product-service';
import { useEffect, useState, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Autoplay from 'embla-carousel-autoplay';

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image');

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

function CategorySkeleton() {
    return (
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-[220px] w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
    )
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);

  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));

  useEffect(() => {
    async function fetchProductsAndCategories() {
      setLoading(true);
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);

      const categoryImageMap: Record<string, string | undefined> = {
        Electronics: PlaceHolderImages.find(
          (img) => img.id === 'category-electronics'
        )?.imageUrl,
        Fashion: PlaceHolderImages.find(
          (img) => img.id === 'category-fashion'
        )?.imageUrl,
        'Home Goods': PlaceHolderImages.find(
          (img) => img.id === 'category-homegoods'
        )?.imageUrl,
        Books: PlaceHolderImages.find((img) => img.id === 'category-books')
          ?.imageUrl,
      };
      const categoryHintMap: Record<string, string | undefined> = {
        Electronics: PlaceHolderImages.find(
          (img) => img.id === 'category-electronics'
        )?.imageHint,
        Fashion: PlaceHolderImages.find(
          (img) => img.id === 'category-fashion'
        )?.imageHint,
        'Home Goods': PlaceHolderImages.find(
          (img) => img.id === 'category-homegoods'
        )?.imageHint,
        Books: PlaceHolderImages.find((img) => img.id === 'category-books')
          ?.imageHint,
      };

      if (fetchedProducts.length > 0) {
        const uniqueCategories = [
          ...new Set(fetchedProducts.map((p) => p.category)),
        ];
        const categoryData = uniqueCategories.map((cat) => ({
          name: cat,
          imageURL:
            categoryImageMap[cat] ||
            `https://picsum.photos/seed/${cat.replace(/\s+/g, '-')}/400/300`,
          imageHint: categoryHintMap[cat] || cat.toLowerCase(),
        }));
        setDynamicCategories(categoryData);
      }

      setLoading(false);
    }
    fetchProductsAndCategories();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            objectFit="cover"
            className="z-0"
            data-ai-hint={heroImage.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col items-start justify-center text-white px-4 md:px-8 lg:px-12">
          <h1 className="text-4xl font-extrabold md:text-6xl">
            Elevate Your Lifestyle
          </h1>
          <p className="mt-4 max-w-lg text-lg">
            Discover curated collections and exclusive deals.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/products">
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-20 px-4 md:px-8 lg:px-12">
        <div className="container">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Shop by Category
          </h2>
          <Carousel
            plugins={[plugin.current]}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            opts={{
              align: 'start',
              loop: true,
            }}
            className="mx-auto w-full"
          >
            <CarouselContent>
              {(loading ? [...Array(4)] : dynamicCategories).map(
                (category, index) => (
                  <CarouselItem
                    key={category?.name || index}
                    className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <div className="p-1">
                      {loading ? (
                        <CategorySkeleton />
                      ) : (
                        <Link href="/products" className="group">
                          <Card className="overflow-hidden transition-all hover:shadow-xl">
                            <CardHeader className="p-0">
                              <Image
                                src={category.imageURL}
                                alt={category.name}
                                width={400}
                                height={300}
                                className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105"
                                data-ai-hint={category.imageHint}
                              />
                            </CardHeader>
                            <CardContent className="p-4">
                              <h3 className="text-center font-semibold">
                                {category.name}
                              </h3>
                            </CardContent>
                          </Card>
                        </Link>
                      )}
                    </div>
                  </CarouselItem>
                )
              )}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-secondary py-12 md:py-20 px-4 md:px-8 lg:px-12">
        <div className="container">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Featured Products
          </h2>
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="mx-auto w-full max-w-sm md:max-w-3xl lg:max-w-5xl"
          >
            <CarouselContent>
              {loading
                ? [...Array(3)].map((_, i) => (
                    <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                      <ProductSkeleton />
                    </CarouselItem>
                  ))
                : products?.slice(0, 8).map((product) => (
                    <CarouselItem
                      key={product.id}
                      className="md:basis-1/2 lg:basis-1/3"
                    >
                      <ProductCard product={product} />
                    </CarouselItem>
                  ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 md:py-20 px-4 md:px-8 lg:px-12">
        <div className="container">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Why Shop With Us?
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Fast Shipping</h3>
              <p className="mt-2 text-muted-foreground">
                Get your orders delivered to your doorstep in no time.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Secure Payments</h3>
              <p className="mt-2 text-muted-foreground">
                Your payments are processed securely with our partners.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Tag className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">Exclusive Deals</h3>
              <p className="mt-2 text-muted-foreground">
                Enjoy access to exclusive deals and discounts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-muted py-12 md:py-20 px-4 md:px-8 lg:px-12">
        <div className="container text-center">
          <h2 className="text-3xl font-bold">Join Our Newsletter</h2>
          <p className="mt-2 text-muted-foreground">
            Sign up to get the latest on sales, new releases and more.
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
