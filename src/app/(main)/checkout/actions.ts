
'use server';

import { getFirestore, writeBatch, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';
import { redirect } from 'next/navigation';
import type { EnrichedCartItem } from '@/app/(main)/cart/actions';
import type { Product } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function placeOrder(formData: FormData) {
    const userId = formData.get('userId') as string;
    const cartItemsJSON = formData.get('cartItems') as string;
    const shippingAddressJSON = formData.get('shippingAddress') as string;
    const customerName = formData.get('customerName') as string;
    const customerEmail = formData.get('customerEmail') as string;
    
    const masterOrderNumber = `ORD-${Date.now()}`;

    if (!userId || !cartItemsJSON || !shippingAddressJSON) {
        console.error("Missing required form data for placing order.");
        return redirect(`/checkout/error?message=An unknown error occurred.`);
    }

    try {
        const cartItems: EnrichedCartItem[] = JSON.parse(cartItemsJSON);
        if (cartItems.length === 0) {
            console.log("Attempted to place an order with an empty cart.");
            return redirect(`/cart`);
        }

        const db = getFirestore(getAdminApp());
        const batch = db.batch();

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
                shippingAddress: JSON.parse(shippingAddressJSON),
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
                    status: 'pending',
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

    } catch (error: any) {
        console.error('Error during order placement:', error.message);
        return redirect(`/checkout/error?message=${encodeURIComponent(error.message)}`);
    }
    
    redirect(`/checkout/success/${masterOrderNumber}`);
}
