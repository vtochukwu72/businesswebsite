
'use server';

import { z } from 'zod';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getAdminApp } from '@/firebase/admin-config';
import { revalidatePath } from 'next/cache';


// Use a separate schema for server-side validation.
const profileSchema = z.object({
  userId: z.string().min(1, 'User ID is required.'),
  fname: z.string().min(1, 'First name is required.'),
  lname: z.string().min(1, 'Last name is required.'),
  phone: z.string().optional(),
});


export async function updateUserProfile(prevState: any, formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const parsed = profileSchema.safeParse(values);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { userId, ...profileData } = parsed.data;
  const fullName = `${profileData.fname} ${profileData.lname}`.trim();

  try {
    const adminApp = getAdminApp();
    const adminAuth = getAuth(adminApp);
    const db = getFirestore(adminApp);
    
    // Update Firebase Auth display name
    await adminAuth.updateUser(userId, {
      displayName: fullName,
    });

    // Update Firestore document
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      ...profileData,
      fullName: fullName,
      updatedAt: FieldValue.serverTimestamp(),
    });
    
    revalidatePath('/account/profile');
    return { success: true, errors: {} };
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    let message = 'An unexpected error occurred.';
    if(error.code === 'auth/user-not-found') {
        message = 'User not found. Could not update profile.';
    }
    return {
      message: error.message || message,
      success: false,
      errors: {},
    };
  }
}

const addressSchema = z.object({
  userId: z.string().min(1),
  fullName: z.string().min(1, 'Full name is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
});


export async function saveUserAddress(prevState: any, formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const parsed = addressSchema.safeParse(values);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { userId, ...addressData } = parsed.data;

  try {
    const adminApp = getAdminApp();
    const db = getFirestore(adminApp);
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      shippingAddress: addressData,
      updatedAt: FieldValue.serverTimestamp(),
    });
    revalidatePath('/account/addresses');
    return { success: true, errors: {} };
  } catch (error: any) {
    return {
      message: error.message || 'An unexpected error occurred.',
      success: false,
      errors: {},
    };
  }
}

export async function toggleWishlist(userId: string, productId: string, isInWishlist: boolean) {
  if (!userId) {
    return { success: false, message: 'User not logged in.' };
  }

  try {
    const adminApp = getAdminApp();
    const db = getFirestore(adminApp);
    const userRef = db.collection('users').doc(userId);

    if (isInWishlist) {
      await userRef.update({
        wishlist: FieldValue.arrayRemove(productId)
      });
    } else {
      await userRef.update({
        wishlist: FieldValue.arrayUnion(productId)
      });
    }
    revalidatePath('/account/wishlist');
    return { success: true, message: isInWishlist ? 'Removed from wishlist' : 'Added to wishlist' };
  } catch (error: any) {
    console.error("Error toggling wishlist:", error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}

    
