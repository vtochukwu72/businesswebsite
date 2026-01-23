'use client';

import { useAuth } from '@/context/auth-context';
import { getEnrichedCartItems } from '@/app/(main)/cart/actions';
import { placeOrder } from './actions';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useFormState, useTransition } from 'react';
import type { EnrichedCartItem } from '@/app/(main)/cart/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CreditCard, Home, Mail, User } from 'lucide-react';
import { useFormStatus } from 'react-dom';


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full" size="lg" type="submit" disabled={pending}>
            {pending ? "Placing Order..." : "Place Order"}
        </Button>
    )
}

export default function CheckoutPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [cartItems, setCartItems] = useState<EnrichedCartItem[]>([]);
    const [cartLoading, setCartLoading] = useState(true);

    const loading = authLoading || cartLoading;

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/login?redirect=/checkout');
            return;
        }

        const cart = userData?.cart;
        if (cart && cart.length > 0) {
            setCartLoading(true);
            getEnrichedCartItems(cart).then(items => {
                setCartItems(items);
                setCartLoading(false);
            });
        } else {
            // If cart is empty, redirect back to the cart page, which shows an "empty" message
            router.push('/cart');
        }
    }, [user, userData, authLoading, router]);

    const { subtotal, shippingTotal, total } = useMemo(() => {
        const subtotal = cartItems.reduce((acc, item) => acc + (item.product.discountedPrice ?? item.product.price) * item.quantity, 0);
        const shippingTotal = cartItems.reduce((acc, item) => acc + (item.product.shippingFee || 0), 0);
        return { subtotal, shippingTotal, total: subtotal + shippingTotal };
    }, [cartItems]);

    const hasAddress = userData?.shippingAddress?.street && userData?.shippingAddress?.city;

    if (loading) {
        return (
            <div className="container py-12">
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div className="space-y-4">
                         <Skeleton className="h-8 w-1/3" />
                         <Skeleton className="h-40 w-full" />
                    </div>
                </div>
            </div>
        )
    }

    if (!user) return null; // Should be redirected by useEffect

    if (!hasAddress) {
        return (
            <div className="container py-16 text-center">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                        <CardTitle className="mt-4">Shipping Address Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>
                            Please add a shipping address to your profile before you can proceed to checkout.
                        </CardDescription>
                         <Button asChild className="mt-6">
                            <Link href="/account/addresses">Add Shipping Address</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container py-12">
             <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
            <form action={placeOrder}>
                 {/* Hidden inputs for the server action */}
                <input type="hidden" name="userId" value={user.uid} />
                <input type="hidden" name="cartItems" value={JSON.stringify(cartItems)} />
                <input type="hidden" name="shippingAddress" value={JSON.stringify(userData.shippingAddress)} />
                <input type="hidden" name="customerName" value={userData.displayName || ''} />
                <input type="hidden" name="customerEmail" value={user.email || ''} />

                <div className="grid md:grid-cols-[1fr_400px] gap-12 items-start">
                    <div className="space-y-8">
                        {/* Shipping Information */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Shipping Information</CardTitle>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/account/addresses">Change</Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-2 text-muted-foreground">
                                <p className="flex items-center gap-2"><User className="h-4 w-4" /> {userData.shippingAddress.fullName}</p>
                                <p className="flex items-center gap-2"><Home className="h-4 w-4" /> {userData.shippingAddress.street}, {userData.shippingAddress.city}, {userData.shippingAddress.state}, {userData.shippingAddress.zipCode}, {userData.shippingAddress.country}</p>
                                <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {user.email}</p>
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                         <Card>
                            <CardHeader>
                                <CardTitle>Payment Method</CardTitle>
                                <CardDescription>All transactions are secure and encrypted.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="h-6 w-6" />
                                        <div>
                                            <p className="font-medium">Pay with Paystack</p>
                                            <p className="text-sm text-muted-foreground">After clicking “Place Order”, you will be redirected to Paystack to complete your purchase securely.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="sticky top-24 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {cartItems.map(item => (
                                    <div key={item.product.id} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <Image src={item.product.images[0]} alt={item.product.name} width={40} height={40} className="rounded-md" />
                                            <span className="truncate max-w-48">{item.product.name} x {item.quantity}</span>
                                        </div>
                                        <span>₦{((item.product.discountedPrice ?? item.product.price) * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₦{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>₦{shippingTotal.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>₦{total.toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>
                        <SubmitButton />
                    </div>
                </div>
            </form>
        </div>
    )
}
