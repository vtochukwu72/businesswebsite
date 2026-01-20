'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { toggleWishlist } from '@/app/(main)/account/actions';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { toast } = useToast();
  const { user, userData } = useAuth();
  const router = useRouter();

  const hasDiscount =
    product.discountedPrice && product.discountedPrice < product.price;
  
  const isInWishlist = userData?.wishlist?.includes(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`
    })
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({
        variant: 'destructive',
        title: "Please log in",
        description: "You need to be logged in to manage your wishlist.",
      });
      router.push('/login');
      return;
    }
    const result = await toggleWishlist(user.uid, product.id, !!isInWishlist);
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
  };


  return (
    <Card
      className={cn(
        'flex h-full flex-col overflow-hidden transition-all hover:shadow-lg',
        className
      )}
    >
      <CardHeader className="relative p-0">
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 left-2 z-10 h-8 w-8 rounded-full bg-background/70 hover:bg-background"
          onClick={handleWishlistToggle}
          aria-label="Toggle Wishlist"
        >
          <Heart className={cn("h-4 w-4", isInWishlist ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
        </Button>

        <Link href={`/products/${product.id}`} className="block">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={600}
            height={600}
            className="aspect-square w-full object-cover"
            data-ai-hint="product image"
          />
        </Link>
        {hasDiscount && (
          <Badge variant="destructive" className="absolute top-3 right-3">
            SALE
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{product.brand}</span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">
              {product.ratings.average.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({product.ratings.count})
            </span>
          </div>
        </div>
        <h3 className="mt-2 font-semibold">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </h3>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold">
            ₦
            {(hasDiscount ? product.discountedPrice : product.price)?.toFixed(
              2
            )}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ₦{product.price.toFixed(2)}
            </span>
          )}
        </div>
        <Button size="sm" onClick={handleAddToCart}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
}
