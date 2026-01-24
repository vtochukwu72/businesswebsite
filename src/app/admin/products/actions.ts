'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';
import { revalidatePath } from 'next/cache';

export async function toggleFeaturedProduct(productId: string, isFeatured: boolean) {
  if (!productId) {
    return { success: false, message: 'Product ID is required.' };
  }

  try {
    const db = getFirestore(getAdminApp());
    const productRef = db.collection('products').doc(productId);

    await productRef.update({
      isFeatured: isFeatured
    });
    
    revalidatePath('/admin/products');
    revalidatePath('/');

    return { success: true, message: `Product is ${isFeatured ? 'now featured' : 'no longer featured'}.` };
  } catch (error: any) {
    console.error("Error toggling featured product:", error);
    return { success: false, message: error.message || 'An error occurred.' };
  }
}
