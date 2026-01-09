'use server';

import { addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import { getSdks } from '@/firebase';
import { revalidatePath } from 'next/cache';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  stockQuantity: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  imageUrl: z.string().url('Must be a valid image URL'),
  brand: z.string().min(1, 'Brand is required'),
  sku: z.string().min(1, 'SKU is required'),
});

export async function addProduct(userId: string, formData: FormData) {
  const values = Object.fromEntries(formData.entries());

  const parsed = productSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const { firestore } = getSdks();
    const productsCollection = collection(firestore, 'products');
    
    const { imageUrl, ...productData } = parsed.data;

    await addDocumentNonBlocking(productsCollection, {
      ...productData,
      images: [imageUrl],
      sellerId: userId,
      isActive: true,
      currency: 'USD', // Default currency
      ratings: {
        average: 0,
        count: 0,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    revalidatePath('/seller/products');

    return { success: true };
  } catch (error) {
    console.error('Error adding product:', error);
    return {
      success: false,
      errors: { _form: ['An unexpected error occurred.'] },
    };
  }
}
