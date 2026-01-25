
'use server';

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';
import { revalidatePath } from 'next/cache';
import type { CartItem, Product, Vendor } from '@/lib/types';
import { getProductsByIds } from '@/services/product-service';
import { getVendorsByIds } from '@/services/vendor-service';


export async function addToCart(userId: string, productId: string, quantity: number) {
  if (!userId) {
    return { success: false, message: 'User not logged in.' };
  }
  if (!productId || quantity <= 0) {
    return { success: false, message: 'Invalid product or quantity.' };
  }

  try {
    const adminApp = getAdminApp();
    const db = getFirestore(adminApp);
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return { success: false, message: 'User not found.' };
    }

    const userData = userDoc.data();
    const cart: CartItem[] = userData?.cart || [];

    const existingItemIndex = cart.findIndex(item => item.productId === productId);

    if (existingItemIndex > -1) {
      // Item exists, update quantity
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Item does not exist, add new item
      cart.push({ productId, quantity });
    }

    await userRef.update({
      cart: cart,
      updatedAt: FieldValue.serverTimestamp(),
    });
    
    // Revalidate paths to update cached data
    revalidatePath('/cart');
    revalidatePath(`/products/${productId}`);

    return { success: true, message: 'Cart updated successfully.' };
  } catch (error: any) {
    console.error("Error adding to cart:", error);
    // In production, you might want to avoid sending back raw error messages.
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}


export async function updateCartItemQuantity(userId: string, productId: string, quantity: number) {
  if (!userId || !productId) {
    return { success: false, message: 'User ID and Product ID are required.' };
  }
  if (quantity <= 0) {
    // If quantity is 0 or less, remove the item.
    return removeCartItem(userId, productId);
  }

  try {
    const adminApp = getAdminApp();
    const db = getFirestore(adminApp);
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return { success: false, message: 'User not found.' };
    }

    const cart: CartItem[] = userDoc.data()?.cart || [];
    const itemIndex = cart.findIndex(item => item.productId === productId);

    if (itemIndex > -1) {
      cart[itemIndex].quantity = quantity;
      await userRef.update({ cart });
      revalidatePath('/cart');
      return { success: true, message: 'Cart updated.' };
    } else {
      return { success: false, message: 'Item not in cart.' };
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'An error occurred.' };
  }
}


export async function removeCartItem(userId: string, productId: string) {
  if (!userId || !productId) {
    return { success: false, message: 'User ID and Product ID are required.' };
  }
  try {
    const adminApp = getAdminApp();
    const db = getFirestore(adminApp);
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return { success: false, message: 'User not found.' };
    }

    const cart: CartItem[] = userDoc.data()?.cart || [];
    const updatedCart = cart.filter(item => item.productId !== productId);
    
    await userRef.update({ cart: updatedCart });
    revalidatePath('/cart');
    return { success: true, message: 'Item removed from cart.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'An error occurred.' };
  }
}


export type EnrichedCartItem = {
    product: Product;
    quantity: number;
    vendorHasPaymentDetails: boolean;
    vendorStoreName: string;
};

export async function getEnrichedCartItems(cart: CartItem[]): Promise<EnrichedCartItem[]> {
    if (!cart || cart.length === 0) {
        return [];
    }

    const productIds = cart.map(item => item.productId);
    const products = await getProductsByIds(productIds);
    const productsMap = new Map(products.map(p => [p.id, p]));

    // Get unique vendor IDs from the products in the cart
    const vendorIds = [...new Set(products.map(p => p.sellerId).filter(id => id))];
    const vendors = await getVendorsByIds(vendorIds);
    const vendorsMap = new Map(vendors.map(v => [v.id, v]));

    const enrichedCart = cart.map(item => {
        const product = productsMap.get(item.productId);
        if (product) {
            const vendor = vendorsMap.get(product.sellerId);
            // A vendor can receive payments if they exist and have a subaccount code.
            const vendorHasPaymentDetails = !!vendor?.payoutDetails?.subaccountCode;
            return {
                product,
                quantity: item.quantity,
                vendorHasPaymentDetails,
                vendorStoreName: vendor?.storeName || 'Unknown Store'
            };
        }
        return null;
    }).filter((item): item is EnrichedCartItem => item !== null);

    return enrichedCart;
}
