'use server';

import { z } from 'zod';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/firebase/config';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const db = getFirestore(app);

const productSchema = z.object({
  sellerId: z.string().min(1, 'Seller ID is required.'),
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  category: z.string().min(1, 'Category is required.'),
  brand: z.string().min(1, 'Brand is required.'),
  stockQuantity: z.coerce.number().int().min(0, 'Stock must be a positive integer.'),
  sku: z.string().min(1, 'SKU is required.'),
  images: z.string().min(1, 'At least one image URL is required.'),
});

export async function addProduct(prevState: any, formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const parsed = productSchema.safeParse(values);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { images, ...productData } = parsed.data;

  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      images: images.split('\n').filter(url => url.trim() !== ''),
      isActive: true, // Product is live immediately
      ratings: { average: 0, count: 0 },
      specifications: {}, // Add empty specs object
      tags: [], // Add empty tags array
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
  } catch (error: any) {
    return {
      message: error.message || 'An unexpected error occurred.',
      success: false,
      errors: {},
    };
  }

  revalidatePath('/seller/products');
  redirect('/seller/products');
}
