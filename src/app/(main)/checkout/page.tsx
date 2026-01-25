'use client';

import { useAuth } from '@/context/auth-context';
import { getEnrichedCartItems } from '@/app/(main)/cart/actions';
import { verifyPaymentAndCreateOrder, OrderPayload, prepareSplitTransaction } from './actions';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useTransition } from 'react';
import type { EnrichedCartItem } from '@/app/(main)/cart/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CreditCard, Home, Mail, User, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function CheckoutPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [cartItems, setCartItems] = useState<EnrichedCartItem[]>([]);
    const [cartLoading, setCartLoading] = useState(true);
    const [isPlacingOrder, startTransition] = useTransition();
    const [unpayableItems, setUnpayableItems] = useState<EnrichedCartItem[]>([]);

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
                if (items.length > 0) {
                    setCartItems(items);
                    const unpayable = items.filter(item => !item.vendorHasPaymentDetails);
                    setUnpayableItems(unpayable);
                } else {
                    router.push('/cart'); 
                }
            }).catch(error => {
                console.error("Error fetching enriched cart items:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error Loading Cart',
                    description: 'There was a problem loading your cart details.'
                });
            }).finally(() => {
                setCartLoading(false);
            });
        } else if (!authLoading) { // Only redirect if we are sure the cart is empty
            router.push('/cart');
        }
    }, [user, userData, authLoading, router, toast]);

    const { subtotal, shippingTotal, total } = useMemo(() => {
        const subtotal = cartItems.reduce((acc, item) => acc + (item.product.discountedPrice ?? item.product.price) * item.quantity, 0);
        const shippingTotal = cartItems.reduce((acc, item) => acc + (item.product.shippingFee || 0) * item.quantity, 0);
        return { subtotal, shippingTotal, total: subtotal + shippingTotal };
    }, [cartItems]);
    
     const canPay = useMemo(() => {
        if (cartItems.length === 0) return false;
        return unpayableItems.length === 0;
    }, [cartItems, unpayableItems]);

    const handlePaystackPayment = () => {
        if (typeof window.PaystackPop === 'undefined') {
            toast({
                variant: 'destructive',
                title: "Payment Gateway Error",
                description: "Could not connect to Paystack. Please check your internet connection and try again.",
            });
            return;
        }
        if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || !user) {
            toast({
                variant: 'destructive',
                title: "Configuration Error",
                description: "Paystack public key is not configured or user is not logged in.",
            });
            return;
        }

        startTransition(async () => {
             const prepResult = await prepareSplitTransaction(user.uid);

             if (!prepResult.success || !prepResult.transactionDetails) {
                 toast({ variant: 'destructive', title: 'Checkout Error', description: prepResult.message || 'Could not prepare transaction.' });
                 return;
             }
             
             const { amount, email, ref, subaccounts } = prepResult.transactionDetails;

            const handler = window.PaystackPop.setup({
                key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
                email: email,
                amount: amount, // Amount in kobo from server
                ref: ref, // Unique ref from server
                subaccounts: subaccounts,
                bearer: 'subaccount', // The subaccounts bear the transaction charges
                onClose: function(){
                    toast({
                        variant: 'destructive',
                        title: 'Payment window closed.',
                        description: "Your order was not placed."
                    });
                },
                callback: async function(response: { reference: string }) {
                    const payload: OrderPayload = {
                        userId: user!.uid,
                        shippingAddress: userData.shippingAddress,
                        customerName: userData.displayName || '',
                        customerEmail: user!.email || '',
                    };
                    const result = await verifyPaymentAndCreateOrder(payload, response.reference);

                    if (result.success) {
                        toast({
                            title: 'Payment Successful!',
                            description: 'Your order has been placed. Redirecting to your orders page.'
                        });
                        router.push(`/account/orders`);
                    } else {
                        router.push(`/checkout/error?message=${encodeURIComponent(result.message || 'Payment verification failed.')}`);
                    }
                }
            });
            handler.openIframe();
        });
    };

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

    if (!user) return null;

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
                <div className="grid md:grid-cols-[1fr_400px] gap-12 items-start">
                    <div className="space-y-8">
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
                    </div>

                    <div className="sticky top-24 space-y-4">
                        {!canPay && (
                            <Card className="border-destructive bg-destructive/10 text-destructive">
                                <CardHeader className="flex-row items-center gap-3 space-y-0 p-4">
                                    <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                                    <div>
                                        <CardTitle className="text-base">Payment Blocked</CardTitle>
                                        <CardDescription className="text-sm text-destructive/90">
                                            Your cart contains items from vendors who cannot receive payments.
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                 <CardContent className="p-4 pt-0">
                                     <Button asChild variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/20">
                                        <Link href="/cart">Return to Cart</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
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
                         <Button 
                            className="w-full" 
                            size="lg" 
                            onClick={handlePaystackPayment}
                            disabled={isPlacingOrder || loading || cartItems.length === 0 || !canPay}
                        >
                            {isPlacingOrder ? 'Processing...' : `Pay ₦${total.toFixed(2)}`}
                        </Button>
                    </div>
                </div>
        </div>
    )
}
