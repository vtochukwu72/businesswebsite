'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { verifyPaymentAndCreateOrder } from '@/app/(main)/checkout/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

function VerifyPaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, userData, loading } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (loading) {
            return; // Wait for auth state to be loaded
        }

        if (!user || !userData) {
            toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'You must be logged in to verify a payment.',
            });
            router.replace('/login');
            return;
        }

        const reference = searchParams.get('reference');
        if (!reference) {
            toast({
                variant: 'destructive',
                title: 'Invalid Request',
                description: 'Payment reference is missing.',
            });
            router.replace('/cart');
            return;
        }
        
        async function verify() {
            const payload = {
                userId: user!.uid,
                shippingAddress: userData.shippingAddress,
                customerName: userData.displayName || '',
                customerEmail: user!.email || '',
            };
            const result = await verifyPaymentAndCreateOrder(payload, reference);

            if (result.success) {
                toast({
                    title: 'Payment Successful!',
                    description: 'Your order has been placed successfully.',
                });
                if (result.orderIds && result.orderIds.length > 0) {
                    router.replace(`/account/orders/${result.orderIds[0]}`);
                } else {
                    router.replace('/account/orders'); 
                }
            } else {
                router.replace(`/checkout/error?message=${encodeURIComponent(result.message || 'Payment verification failed.')}`);
            }
        }
        
        verify();

    }, [loading, user, userData, router, searchParams, toast]);

    return (
        <div className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h1 className="mt-8 text-2xl font-bold">Verifying Your Payment</h1>
            <p className="mt-2 text-muted-foreground">Please wait while we confirm your transaction. Do not close this window.</p>
        </div>
    );
}


export default function VerifyPaymentPage() {
    return (
        <Suspense fallback={
             <div className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
             </div>
        }>
            <VerifyPaymentContent />
        </Suspense>
    );
}
