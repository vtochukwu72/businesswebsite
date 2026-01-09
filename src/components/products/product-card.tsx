'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import type { Product, Wishlist } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  WithId,
  useUser,
  useFirestore,
  useDoc,
  useMemoFirebase,
} from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: WithId<Product>;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const hasDiscount =
    product.discountedPrice && product.discountedPrice < product.price;

  const wishlistRef = useMemoFirebase(
    () =>
      firestore && user
        ? doc(firestore, 'users', user.uid, 'wishlists', 'default')
        : null,
    [firestore, user]
  );
  const { data: wishlist } = useDoc<Wishlist>(wishlistRef);

  const isInWishlist =
    wishlist?.items?.some((item) => item.productId === product.id) || false;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product page
    if (!user || !wishlistRef) {
      toast({
        variant: 'destructive',
        title: 'Not signed in',
        description: 'Please sign in to add items to your wishlist.',
      });
      return;
    }

    const wishlistItem = {
      productId: product.id,
      addedAt: new Date(),
    };

    if (isInWishlist) {
      await updateDoc(wishlistRef, {
        items: arrayRemove(
          ...wishlist!.items!.filter((item) => item.productId === product.id)
        ),
      });
      toast({
        title: 'Removed from wishlist',
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      await updateDoc(
        wishlistRef,
        {
          items: arrayUnion(wishlistItem),
          userId: user.uid,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      toast({
        title: 'Added to wishlist',
        description: `${product.name} has been added to your wishlist.`,
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
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/50 hover:bg-background"
          onClick={handleWishlistToggle}
        >
          <Heart
            className={cn(
              'h-5 w-5 text-destructive',
              isInWishlist && 'fill-destructive'
            )}
          />
          <span className="sr-only">
            {isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          </span>
        </Button>
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
        <Button size="sm">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
}
