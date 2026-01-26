'use server';

import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';
import { revalidatePath } from 'next/cache';

const carouselTextSchema = z.object({
  productId: z.string().min(1),
  carouselHeadline: z.string().optional(),
  carouselDescription: z.string().optional(),
});

export async function updateCarouselText(prevState: any, formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const parsed = carouselTextSchema.safeParse(values);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      success: false,
      message: 'Invalid data provided.'
    };
  }
  
  const { productId, carouselHeadline, carouselDescription } = parsed.data;

  try {
    const db = getFirestore(getAdminApp());
    const productRef = db.collection('products').doc(productId);
    
    await productRef.update({
      carouselHeadline: carouselHeadline || '',
      carouselDescription: carouselDescription || ''
    });

    revalidatePath('/admin/site-management');
    revalidatePath('/');
    
    return { success: true, errors: {}, message: 'Carousel text updated successfully.' };

  } catch (error: any) {
    return {
      success: false,
      errors: {},
      message: error.message || 'An unexpected error occurred.',
    };
  }
}

    