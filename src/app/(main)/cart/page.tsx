
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Plus, Minus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState, useMemo, useTransition, useRef } from 'react';
import type { Product, CartItem as CartItemType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getEnrichedCartItems, updateCartItemQuantity, removeCartItem, type EnrichedCartItem } from './actions';
import { useRouter } from 'next/navigation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ProductCard } from '@/components/products/product-card';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Autoplay from 'embla-carousel-autoplay';
import { serializeFirestoreData } from '@/lib/utils';

function CartItemSkeleton() {
    return (
        <div className="flex items-center gap-4 py-4">
            <Skeleton className="h-24 w-24 rounded-md" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8" />
        </div>
    )
}

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

export default function CartPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [cartItems, setCartItems] = useState<EnrichedCartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, startTransition] = useTransition();
    const { toast } = useToast();
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [featuredLoading, setFeaturedLoading] = useState(true);
    const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }));


    useEffect(() => {
        if (authLoading) {
            setIsLoading(true);
            return;
        }

        if (!user) {
            setIsLoading(false);
            // Optionally redirect to login or show a message
            return;
        }

        const cart = userData?.cart as CartItemType[] | undefined;

        if (cart && cart.length > 0) {
            setIsLoading(true);
            getEnrichedCartItems(cart)
                .then(items => {
                    setCartItems(items);
                })
                .catch(err => {
                    console.error("Error fetching cart items", err);
                    toast({ variant: 'destructive', title: "Could not load cart."});
                })
                .finally(() => setIsLoading(false));
        } else {
            setCartItems([]);
            setIsLoading(false);
        }

    }, [userData?.cart, user, authLoading, toast]);
    
     useEffect(() => {
        setFeaturedLoading(true);
        const productsQuery = query(collection(db, 'products'));

        const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
            const fetchedProducts: Product[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...serializeFirestoreData(data),
                } as Product;
            });
            const cartProductIds = cartItems.map(item => item.product.id);
            setFeaturedProducts(fetchedProducts.filter(p => !cartProductIds.includes(p.id)));
            setFeaturedLoading(false);
        }, (error) => {
            const permissionError = new FirestorePermissionError({
              path: 'products',
              operation: 'list'
            }, error);
            errorEmitter.emit('permission-error', permissionError);
            console.error("Error fetching featured products for cart page:", error);
            toast({
                variant: 'destructive',
                title: 'Could not load featured products.',
            });
            setFeaturedLoading(false);
        });

        return () => unsubscribe();
    }, [toast, cartItems]);

    const handleQuantityChange = (productId: string, newQuantity: number) => {
        if (!user) return;
        startTransition(async () => {
            await updateCartItemQuantity(user.uid, productId, newQuantity);
        });
    }

    const handleRemoveItem = (productId: string) => {
        if (!user) return;
        startTransition(async () => {
            const result = await removeCartItem(user.uid, productId);
            if (result.success) {
                toast({ title: "Item removed" });
            } else {
                toast({ variant: 'destructive', title: "Could not remove item", description: result.message });
            }
        });
    }
    
    const { subtotal, shippingTotal } = useMemo(() => {
        const subtotal = cartItems.reduce((acc, item) => {
            const price = item.product.discountedPrice ?? item.product.price;
            return acc + (price * item.quantity);
        }, 0);
        const shippingTotal = cartItems.reduce((acc, item) => {
            return acc + (item.product.shippingFee || 0) * item.quantity;
        }, 0);
        return { subtotal, shippingTotal };
    }, [cartItems]);
    
    const canCheckout = useMemo(() => {
        if (cartItems.length === 0) return false;
        return cartItems.every(item => item.vendorHasPaymentDetails);
    }, [cartItems]);


    if (isLoading || authLoading) {
        return (
            <div className="container py-8">
                 <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
                 <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        <CartItemSkeleton />
                        <CartItemSkeleton />
                    </div>
                    <div className="md:col-span-1">
                         <Card>
                            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                         </Card>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
             {(!user || cartItems.length === 0) ? (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                  <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
                  <h2 className="mt-6 text-xl font-semibold">
                      {user ? "Your cart is empty" : "Please log in to view your cart"}
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    {user ? "Looks like you haven't added anything to your cart yet." : "Log in to start shopping and add items to your cart."}
                  </p>
                  <Button asChild className="mt-6">
                    <Link href={user ? "/products" : "/login"}>{user ? "Start Shopping" : "Log In"}</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2">
                        <Card>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {cartItems.map(item => (
                                        <div key={item.product.id} className="flex flex-col gap-2 p-4">
                                            <div className="flex items-center gap-4">
                                                <Image src={item.product.images[0]} alt={item.product.name} width={96} height={96} className="rounded-md" />
                                                <div className="flex-1">
                                                    <Link href={`/products/${item.product.id}`} className="font-semibold hover:underline">{item.product.name}</Link>
                                                    <p className="text-sm text-muted-foreground">₦{(item.product.discountedPrice ?? item.product.price).toFixed(2)}</p>
                                                </div>
                                                <div className="flex items-center border rounded-md">
                                                <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)} disabled={isUpdating || item.quantity <= 1}>
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="px-3 text-sm font-bold">{item.quantity}</span>
                                                <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)} disabled={isUpdating || item.quantity >= item.product.stockQuantity}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                                </div>
                                                <p className="font-semibold w-24 text-right">₦{((item.product.discountedPrice ?? item.product.price) * item.quantity).toFixed(2)}</p>
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.product.id)} disabled={isUpdating}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                            {!item.vendorHasPaymentDetails && (
                                                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded-md ml-[112px]">
                                                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                                    <span>Vendor '{item.vendorStoreName}' cannot receive payments. Please remove this item to check out.</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-1 sticky top-24 space-y-4">
                        {!canCheckout && !isLoading && (
                             <Card className="border-destructive bg-destructive/10 text-destructive">
                                <CardHeader className="flex-row items-center gap-3 space-y-0 p-4">
                                    <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                                    <div>
                                        <CardTitle className="text-base">Checkout Disabled</CardTitle>
                                        <CardDescription className="text-sm text-destructive/90">
                                            Remove items from vendors who can't receive payments to proceed.
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        )}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₦{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>₦{shippingTotal.toFixed(2)}</span>
                                </div>
                                 <div className="flex justify-between">
                                    <span>Taxes</span>
                                    <span className="text-muted-foreground">Calculated at checkout</span>
                                </div>
                                <Separator />
                                 <div className="flex justify-between font-bold text-lg">
                                    <span>Estimated Total</span>
                                    <span>₦{(subtotal + shippingTotal).toFixed(2)}</span>
                                </div>
                                <Button asChild className="w-full" size="lg" disabled={isUpdating || !canCheckout}>
                                    <Link href="/checkout">Proceed to Checkout</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
             <section className="mt-16">
                <h2 className="text-2xl font-bold mb-6 text-center">You Might Also Like</h2>
                {featuredLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
                    </div>
                ) : (
                    <Carousel
                        plugins={[plugin.current]}
                        onMouseEnter={plugin.current.stop}
                        onMouseLeave={plugin.current.reset}
                        opts={{
                            align: 'start',
                            loop: true,
                        }}
                        className="mx-auto w-full max-w-sm md:max-w-3xl lg:max-w-6xl"
                    >
                        <CarouselContent>
                            {featuredProducts.map((product) => (
                                <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                     <div className="p-1">
                                        <ProductCard product={product} />
                                     </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                )}
            </section>
        </div>
    )
}
