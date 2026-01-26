
'use server';

import { getFirestore, writeBatch, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';
import { redirect } from 'next/navigation';
import type { CartItem, Product, Vendor } from '@/lib/types';
import { getProductsByIds } from '@/services/product-service';
import { getVendorsByIds } from '@/services/vendor-service';
import { revalidatePath } from 'next/cache';

const PLATFORM_COMMISSION_PERCENT = 0.10; // 10%

export async function prepareSplitTransaction(userId: string) {
    if (!userId) {
        return { success: false, message: 'User not authenticated.' };
    }
    
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) {
        return { success: false, message: 'Server payment configuration error. Administrator needs to set PAYSTACK_SECRET_KEY.' };
    }

    const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    if (!NEXT_PUBLIC_BASE_URL) {
        return { success: false, message: 'Server configuration error. Administrator needs to set NEXT_PUBLIC_BASE_URL.' };
    }


    try {
        const db = getFirestore(getAdminApp());
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return { success: false, message: 'User not found.' };
        }
        
        const userData = userDoc.data()!;
        const cart: CartItem[] = userData.cart || [];
        if (cart.length === 0) {
            return { success: false, message: 'Your cart is empty.' };
        }

        const productIds = cart.map(item => item.productId);
        const products = await getProductsByIds(productIds);
        const productsMap = new Map(products.map(p => [p.id, p]));

        const vendorTotals: { [vendorId: string]: { subtotal: number, shipping: number } } = {};
        let grandTotal = 0;

        for (const item of cart) {
            const product = productsMap.get(item.productId);
            if (!product) continue;

            const sellerId = product.sellerId;
            if (!vendorTotals[sellerId]) {
                vendorTotals[sellerId] = { subtotal: 0, shipping: 0 };
            }
            const price = product.discountedPrice ?? product.price;
            vendorTotals[sellerId].subtotal += price * item.quantity;
            vendorTotals[sellerId].shipping += (product.shippingFee || 0) * item.quantity;
        }

        const vendorIds = Object.keys(vendorTotals);
        const vendors = await getVendorsByIds(vendorIds);
        
        const subaccounts: { subaccount: string, share: number }[] = [];
        for (const vendor of vendors) {
            if (vendor.payoutDetails?.subaccountCode) {
                const totalForVendor = vendorTotals[vendor.id].subtotal + vendorTotals[vendor.id].shipping;
                const vendorShare = totalForVendor * (1 - PLATFORM_COMMISSION_PERCENT);
                subaccounts.push({
                    subaccount: vendor.payoutDetails.subaccountCode,
                    share: Math.round(vendorShare * 100), // in kobo
                });
                grandTotal += totalForVendor;
            } else {
                 return { success: false, message: `Vendor ${vendor.storeName} is missing payment details and cannot receive payments.` };
            }
        }

        if (subaccounts.length === 0) {
             return { success: false, message: 'Could not find any vendors with payment details for this order.' };
        }
        
        const transactionDetails = {
            email: userData.email,
            amount: Math.round(grandTotal * 100), // Total amount in kobo
            ref: `DEALZA-${userId.slice(0,5)}-${Date.now()}`,
            subaccounts,
            callback_url: `${NEXT_PUBLIC_BASE_URL}/checkout/verify`,
            bearer: 'subaccount'
        };

        const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionDetails),
        });

        const paystackData = await paystackResponse.json();

        if (!paystackData.status) {
            return { success: false, message: `Paystack Error: ${paystackData.message}` };
        }
        
        return { success: true, authorization_url: paystackData.data.authorization_url };

    } catch (error: any) {
        console.error('Error preparing split transaction:', error);
        return { success: false, message: error.message || 'Server error while preparing transaction.' };
    }
}


export interface OrderPayload {
  userId: string;
  shippingAddress: any;
  customerName: string;
  customerEmail: string;
}

export async function verifyPaymentAndCreateOrder(payload: OrderPayload, reference: string) {
    const { userId, shippingAddress, customerName, customerEmail } = payload;

    if (!reference) {
        return { success: false, message: 'Payment reference is missing.' };
    }
    
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) {
        console.error('Paystack secret key is not configured.');
        return { success: false, message: 'Server payment configuration error. Administrator needs to set PAYSTACK_SECRET_KEY.' };
    }

    try {
        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
        });

        const verifyData = await verifyRes.json();

        if (!verifyData.status || verifyData.data.status !== 'success') {
            console.error("Paystack verification failed:", verifyData.message);
            return { success: false, message: verifyData.message || 'Payment verification failed with Paystack.' };
        }
        
        const paidAmountKobo = verifyData.data.amount;
        
        const db = getFirestore(getAdminApp());
        
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) throw new Error('User not found.');
        
        const cart: CartItem[] = userDoc.data()?.cart || [];
        if (cart.length === 0) throw new Error('Cannot create order from an empty cart.');

        const productIds = cart.map(item => item.productId);
        const products = await getProductsByIds(productIds);
        const productsMap = new Map(products.map(p => [p.id, p]));

        const masterOrderNumber = `ORD-${Date.now()}`;
        const ordersByVendor = new Map<string, { items: any[], subtotal: number, shipping: number }>();
        let calculatedTotalKobo = 0;

        for (const item of cart) {
            const product = productsMap.get(item.productId);
            if (!product) continue;
            
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
            calculatedTotalKobo += (price * item.quantity + (product.shippingFee || 0) * item.quantity) * 100;
        }

        if (Math.abs(paidAmountKobo - calculatedTotalKobo) > 100) { // Allow for minor rounding diffs
             return { success: false, message: `Payment amount mismatch. Expected ${Math.round(calculatedTotalKobo)}, but paid ${paidAmountKobo}.` };
        }
        
        const batch = db.batch();
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
                shippingAddress,
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
        
        batch.update(userRef, { cart: [] });

        await batch.commit();
        
        revalidatePath('/cart');
        revalidatePath('/account/orders');

        return { success: true };

    } catch (error: any) {
        console.error('Error during order placement:', error.message);
        return { success: false, message: error.message || 'An unknown server error occurred.' };
    }
}
