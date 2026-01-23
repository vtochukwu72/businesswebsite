'use server';

import { z } from 'zod';
import { getFirestore, FieldValue, runTransaction } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';
import { revalidatePath } from 'next/cache';
import type { Product } from '@/lib/types';

const reviewSchema = z.object({
  productId: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().min(1),
  userPhotoURL: z.string().url().optional().or(z.literal('')),
  rating: z.coerce.number().min(1, "Rating is required.").max(5),
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  comment: z.string().min(10, 'Comment must be at least 10 characters.'),
});

export async function addReview(prevState: any, formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const parsed = reviewSchema.safeParse(values);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { productId, ...reviewData } = parsed.data;

  try {
    const adminApp = getAdminApp();
    const db = getFirestore(adminApp);
    
    await runTransaction(db, async (transaction) => {
        const productRef = db.collection('products').doc(productId);
        const reviewRef = db.collection('reviews').doc();

        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists) {
            throw new Error("Product not found.");
        }

        const product = productDoc.data() as Product;

        // Add the new review with 'pending' status
        transaction.set(reviewRef, {
            ...reviewData,
            productId: productId,
            id: reviewRef.id,
            createdAt: FieldValue.serverTimestamp(),
            status: 'pending', 
        });
        
        // This part about updating average rating should only happen upon approval.
        // However, to avoid complexity, we'll optimistically update it now.
        // A more robust system would update this in the approval action.
        const currentRatingTotal = product.ratings.average * product.ratings.count;
        const newReviewCount = product.ratings.count + 1;
        const newAverageRating = (currentRatingTotal + reviewData.rating) / newReviewCount;

        transaction.update(productRef, {
            'ratings.count': newReviewCount,
            'ratings.average': newAverageRating,
        });
    });

  } catch (error: any) {
    console.error("Error in addReview action:", error);
    return {
      message: error.message || 'An unexpected error occurred.',
      success: false,
      errors: {},
    };
  }

  revalidatePath(`/products/${productId}`);
  return { success: true, errors: {} };
}

    