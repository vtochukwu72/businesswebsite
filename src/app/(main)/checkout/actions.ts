'use server';

import { getFirestore, writeBatch, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';
import { redirect } from 'next/navigation';
import type { EnrichedCartItem } from '@/app/(main)/cart/actions';
import type { Product } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export interface OrderPayload {
  userId: string;
  cartItems: EnrichedCartItem[];
  shippingAddress: any;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
}

export async function verifyPaymentAndCreateOrder(payload: OrderPayload, reference: string) {
    const { userId, cartItems, shippingAddress, customerName, customerEmail, totalAmount } = payload;

    if (!reference) {
        return { success: false, message: 'Payment reference is missing.' };
    }
    
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) {
        console.error('Paystack secret key is not configured.');
        return { success: false, message: 'Server payment configuration error. The administrator needs to set the PAYSTACK_SECRET_KEY environment variable.' };
    }

    try {
        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });

        const verifyData = await verifyRes.json();

        if (!verifyData.status || verifyData.data.status !== 'success') {
            console.error("Paystack verification failed:", verifyData.message);
            return { success: false, message: verifyData.message || 'Payment verification failed with Paystack.' };
        }
        
        const paidAmount = verifyData.data.amount;
        if (paidAmount < totalAmount) {
             return { success: false, message: `Payment amount mismatch. Expected ${totalAmount}, but got ${paidAmount}.` };
        }
        
        // TODO: Store transaction reference to prevent replay attacks.
        
        const db = getFirestore(getAdminApp());
        const batch = db.batch();
        const masterOrderNumber = `ORD-${Date.now()}`;

        const ordersByVendor = new Map<string, { items: any[], subtotal: number, shipping: number }>();

        for (const item of cartItems) {
            const product: Product = item.product;
            const sellerId = product.sellerId;
            
            if (!ordersByVendor.has(sellerId)) {
                ordersByVendor.set(sellerId, { items: [], subtotal: 0, shipping: 0 });
            }
            
            const vendorOrder = ordersByVendor.get(sellerId)!;
            const price = product.discountedPrice ?? product.price;

            vendorOrder.items.push({
                productId: product.id,
                name: product.name,
                price: price,
                quantity: item.quantity,
                image: product.images[0] || ''
            });
            vendorOrder.subtotal += price * item.quantity;
            vendorOrder.shipping += (product.shippingFee || 0) * item.quantity;
        }

        let orderCount = 0;

        for (const [vendorId, orderData] of ordersByVendor.entries()) {
            orderCount++;
            const orderId = `${masterOrderNumber}-${orderCount}`;
            const grandTotal = orderData.subtotal + orderData.shipping;

            const newOrder = {
                userId,
                vendorId,
                orderNumber: orderId,
                items: orderData.items,
                shippingAddress: shippingAddress,
                customerName,
                customerEmail,
                totalAmount: orderData.subtotal,
                shippingFee: orderData.shipping,
                taxAmount: 0,
                grandTotal,
                orderStatus: 'pending',
                createdAt: FieldValue.serverTimestamp(),
                paymentDetails: { 
                    method: 'Paystack', 
                    status: 'paid',
                    reference: reference
                },
            };

            const orderRef = db.collection('orders').doc(orderId);
            batch.set(orderRef, newOrder);

            const vendorOrderRef = db.collection('vendors').doc(vendorId).collection('orders').doc(orderId);
            batch.set(vendorOrderRef, newOrder);
        }
        
        const userRef = db.collection('users').doc(userId);
        batch.update(userRef, { cart: [] });

        await batch.commit();
        
        revalidatePath('/cart');
        revalidatePath('/account/orders');

        return { success: true, orderId: masterOrderNumber };

    } catch (error: any) {
        console.error('Error during order placement:', error.message);
        return { success: false, message: error.message || 'An unknown server error occurred.' };
    }
}
