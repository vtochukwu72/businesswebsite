import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;

  return (
    <Card className={cn('flex h-full flex-col overflow-hidden transition-all hover:shadow-lg', className)}>
      <CardHeader className="relative p-0">
        <Link href={`/products/${product.productId}`} className="block">
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
          <Badge
            variant="destructive"
            className="absolute top-3 right-3"
          >
            SALE
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{product.brand}</span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.ratings.average.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({product.ratings.count})</span>
          </div>
        </div>
        <h3 className="mt-2 font-semibold">
          <Link href={`/products/${product.productId}`}>{product.name}</Link>
        </h3>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold">
            ${(hasDiscount ? product.discountedPrice : product.price)?.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.price.toFixed(2)}
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
