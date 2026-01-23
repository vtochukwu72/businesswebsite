'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState, useMemo, useTransition } from 'react';
import type { Product, CartItem as CartItemType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getEnrichedCartItems, updateCartItemQuantity, removeCartItem } from './actions';
import { useRouter } from 'next/navigation';

type EnrichedCartItem = {
    product: Product;
    quantity: number;
};

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

export default function CartPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [cartItems, setCartItems] = useState<EnrichedCartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, startTransition] = useTransition();
    const { toast } = useToast();

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

    if (!user || cartItems.length === 0) {
         return (
            <div className="container py-8">
              <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
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
            </div>
          );
    }
    
    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-2">
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {cartItems.map(item => (
                                    <div key={item.product.id} className="flex items-center gap-4 p-4">
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
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-1 sticky top-24">
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
                            <Button className="w-full" size="lg" disabled={isUpdating}>Proceed to Checkout</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

    