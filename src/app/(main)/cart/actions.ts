'use server';

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';
import { revalidatePath } from 'next/cache';
import type { CartItem } from '@/lib/types';


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
