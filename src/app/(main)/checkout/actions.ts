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

    if (!userId || !cartItemsJSON || !shippingAddressJSON) {
        // This should redirect to an error page or show a toast on the client.
        // For now, we'll just log it.
        console.error("Missing required form data for placing order.");
        return;
    }

    const cartItems: EnrichedCartItem[] = JSON.parse(cartItemsJSON);
    const shippingAddress = JSON.parse(shippingAddressJSON);

    if (cartItems.length === 0) {
        console.log("Attempted to place an order with an empty cart.");
        return;
    }

    const db = getFirestore(getAdminApp());
    const batch = db.batch();

    // Group items by seller
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

    const masterOrderNumber = `ORD-${Date.now()}`;
    let orderCount = 0;

    // Create a sub-order for each vendor
    for (const [vendorId, orderData] of ordersByVendor.entries()) {
        orderCount++;
        const orderId = `${masterOrderNumber}-${orderCount}`;
        const grandTotal = orderData.subtotal + orderData.shipping; // Simplified total

        const newOrder = {
            userId,
            vendorId,
            orderNumber: orderId,
            items: orderData.items,
            shippingAddress,
            customerName,
            customerEmail,
            totalAmount: orderData.subtotal,
            shippingFee: orderData.shipping,
            taxAmount: 0, // Placeholder
            grandTotal,
            orderStatus: 'pending',
            createdAt: FieldValue.serverTimestamp(),
            paymentDetails: { method: 'Paystack', status: 'pending' }, // Placeholder
        };

        // Add to top-level /orders collection
        const orderRef = db.collection('orders').doc(orderId);
        batch.set(orderRef, newOrder);

        // Add to vendor-specific /vendors/{vendorId}/orders sub-collection
        const vendorOrderRef = db.collection('vendors').doc(vendorId).collection('orders').doc(orderId);
        batch.set(vendorOrderRef, newOrder);
    }
    
    // Clear user's cart
    const userRef = db.collection('users').doc(userId);
    batch.update(userRef, { cart: [] });

    await batch.commit();
    
    // Revalidate paths to ensure fresh data after order placement
    revalidatePath('/cart');
    revalidatePath('/account/orders');

    redirect(`/checkout/success/${masterOrderNumber}`);
}
