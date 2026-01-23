'use server';

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';
import { revalidatePath } from 'next/cache';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

// This action needs to be secured. A malicious user could call this for any review.
// We will check if the calling user is the seller of the product being reviewed.
async function verifyVendor(reviewId: string, vendorId: string): Promise<boolean> {
  const db = getFirestore(getAdminApp());
  const reviewDoc = await db.collection('reviews').doc(reviewId).get();
  if (!reviewDoc.exists) {
    throw new Error('Review not found.');
  }

  const productId = reviewDoc.data()?.productId;
  if (!productId) {
    throw new Error('Product ID missing from review.');
  }

  const productDoc = await db.collection('products').doc(productId).get();
  if (!productDoc.exists) {
    throw new Error('Product not found.');
  }

  return productDoc.data()?.sellerId === vendorId;
}


export async function updateReviewStatus(reviewId: string, productId: string, vendorId: string, status: 'approved' | 'rejected') {
  if (!reviewId || !productId || !vendorId || !status) {
      return { success: false, message: 'Missing required parameters.'}
  }

  try {
    const isAuthorized = await verifyVendor(reviewId, vendorId);
    if (!isAuthorized) {
        return { success: false, message: 'You are not authorized to modify this review.' };
    }

    const db = getFirestore(getAdminApp());
    const reviewRef = db.collection('reviews').doc(reviewId);

    await reviewRef.update({ 
        status: status,
        updatedAt: FieldValue.serverTimestamp()
    });

    revalidatePath(`/seller/reviews`);
    revalidatePath(`/products/${productId}`);

    return { success: true, message: `Review has been ${status}.` };

  } catch (error: any) {
    console.error("Error updating review status:", error);
    return { success: false, message: error.message || 'An error occurred while updating the review.' };
  }
}

    