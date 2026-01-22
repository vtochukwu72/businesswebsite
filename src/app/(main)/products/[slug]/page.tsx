'use client';
import Image from 'next/image';
import { Star, Plus, Minus, ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Product, Review } from '@/lib/types';
import { useState, useEffect } from 'react';
import { getProduct } from '@/services/product-service';
import { useAuth } from '@/context/auth-context';
import { toggleWishlist } from '@/app/(main)/account/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { addToCart } from '@/app/(main)/cart/actions';

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const isInWishlist = userData?.wishlist?.includes(params.slug);
  
  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const foundProduct = await getProduct(params.slug);
      setProduct(foundProduct);
      setLoading(false);
    }
    fetchProduct();
  }, [params.slug]);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
        toast({
            variant: 'destructive',
            title: "Please log in",
            description: "You need to be logged in to manage your wishlist.",
        });
        router.push('/login');
        return;
    }
    const result = await toggleWishlist(user.uid, params.slug, !!isInWishlist);
    if (result.success) {
        toast({
            title: result.message,
        });
    } else {
        toast({
            variant: 'destructive',
            title: "Something went wrong",
            description: result.message || "Could not update your wishlist.",
        });
    }
  }


  // Placeholder for reviews
  const reviews: Review[] = [];

  if (loading) {
    return <div className="container py-8 text-center">Loading product...</div>
  }

  if (!product) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="text-muted-foreground">
          Sorry, we couldn't find the product you were looking for.
        </p>
      </div>
    );
  }

  const handleIncrement = () => {
    setQuantity(prev => Math.min(prev + 1, product.stockQuantity));
  };

  const handleDecrement = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };
  
  const handleAddToCart = async () => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: "Please log in",
            description: "You need to be logged in to add items to your cart.",
        });
        router.push('/login');
        return;
    }
    const result = await addToCart(user.uid, product.id, quantity);
    if (result.success) {
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} have been added to your cart.`
      });
    } else {
       toast({
            variant: 'destructive',
            title: "Something went wrong",
            description: result.message || "Could not add item to cart.",
        });
    }
  };

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Image
            src={product.images[0]}
            alt={product.name}
            width={800}
            height={800}
            className="w-full rounded-lg shadow-lg"
            data-ai-hint="product image"
          />
          <div className="grid grid-cols-4 gap-4 mt-4">
            {product.images.slice(0, 4).map((img, index) => (
              <button
                key={index}
                className="rounded-lg overflow-hidden border-2 border-primary"
              >
                <Image
                  src={img}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  width={150}
                  height={150}
                  className="w-full object-cover"
                  data-ai-hint="product image"
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(product.ratings.average)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">
              ({product.ratings.count} reviews)
            </span>
          </div>
          <div className="mt-4 text-3xl font-bold">
            ₦{product.discountedPrice?.toFixed(2) || product.price.toFixed(2)}
            {product.discountedPrice && (
              <span className="ml-4 text-xl text-muted-foreground line-through">
                ₦{product.price.toFixed(2)}
              </span>
            )}
          </div>
          <p className="mt-4 text-muted-foreground">{product.description}</p>
          <Separator className="my-6" />
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" onClick={handleDecrement} disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-4 font-bold">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={handleIncrement} disabled={quantity >= product.stockQuantity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button size="lg" className="flex-1" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <Button size="icon" variant="outline" onClick={handleWishlistToggle} aria-label="Toggle Wishlist">
              <Heart className={cn("h-5 w-5", isInWishlist ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
            </Button>
          </div>
          {product.stockQuantity < 10 && product.stockQuantity > 0 && (
            <p className="text-sm text-destructive mt-2">Only {product.stockQuantity} left in stock!</p>
          )}
           {product.stockQuantity === 0 && (
            <p className="text-sm text-destructive mt-2">Out of stock</p>
          )}
        </div>
      </div>
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({product.ratings.count})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="py-4">
            <p>{product.description}</p>
          </TabsContent>
          <TabsContent value="specifications" className="py-4">
            <ul className="space-y-2">
              {Object.entries(product.specifications).map(([key, value]) => (
                <li key={key} className="flex">
                  <span className="font-semibold w-1/3">{key}:</span>
                  <span>{value as string}</span>
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="reviews" className="py-4">
            {reviews.length > 0 ? (
                <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.reviewId} className="flex gap-4">
                    <Avatar>
                        <AvatarImage
                        src={review.user?.avatar}
                        alt={review.user?.name}
                        data-ai-hint="person portrait"
                        />
                        <AvatarFallback>{review.user?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{review.user?.name}</h4>
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-4 w-4 ${
                                i < review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                            />
                            ))}
                        </div>
                        </div>
                        <h5 className="font-bold mt-1">{review.title}</h5>
                        <p className="text-muted-foreground mt-1">{review.comment}</p>
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-muted-foreground">No reviews yet for this product.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
