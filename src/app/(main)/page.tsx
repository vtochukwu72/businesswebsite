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
import { products as staticProducts } from '@/lib/static-data';


const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image');
const categories = [
  {
    categoryId: '1',
    name: 'Electronics',
    imageURL:
      PlaceHolderImages.find((img) => img.id === 'category-electronics')
        ?.imageUrl || '',
    imageHint:
      PlaceHolderImages.find((img) => img.id === 'category-electronics')
        ?.imageHint || 'category image',
  },
  {
    categoryId: '2',
    name: 'Fashion',
    imageURL:
      PlaceHolderImages.find((img) => img.id === 'category-fashion')
        ?.imageUrl || '',
    imageHint:
      PlaceHolderImages.find((img) => img.id === 'category-fashion')
        ?.imageHint || 'category image',
  },
  {
    categoryId: '3',
    name: 'Home Goods',
    imageURL:
      PlaceHolderImages.find((img) => img.id === 'category-homegoods')
        ?.imageUrl || '',
    imageHint:
      PlaceHolderImages.find((img) => img.id === 'category-homegoods')
        ?.imageHint || 'category image',
  },
  {
    categoryId: '4',
    name: 'Books',
    imageURL:
      PlaceHolderImages.find((img) => img.id === 'category-books')?.imageUrl ||
      '',
    imageHint:
      PlaceHolderImages.find((img) => img.id === 'category-books')
        ?.imageHint || 'category image',
  },
];
export default function HomePage() {
  const products: Product[] = staticProducts;

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
        <div className="container relative z-10 flex h-full flex-col items-start justify-center text-white">
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
      <section className="py-12 md:py-20">
        <div className="container">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((category) => (
              <Link href="/products" key={category.categoryId} className="group">
                <Card className="overflow-hidden transition-all hover:shadow-xl">
                  <CardHeader className="p-0">
                    <Image
                      src={category.imageURL}
                      alt={category.name}
                      width={400}
                      height={300}
                      className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
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
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-secondary py-12 md:py-20">
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
              {products?.slice(0,8).map((product) => (
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
      <section className="py-12 md:py-20">
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
      <section className="bg-muted py-12 md:py-20">
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
