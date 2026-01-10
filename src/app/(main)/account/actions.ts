
'use server';

import { z } from 'zod';
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getAdminApp } from '@/firebase/admin-config';


// Ensure Firebase is initialized
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

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
    const adminAuth = getAdminAuth(adminApp);
    
    // Update Firebase Auth display name
    await adminAuth.updateUser(userId, {
      displayName: fullName,
    });

    // Update Firestore document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...profileData,
      fullName: fullName,
      updatedAt: serverTimestamp(),
    });
    return { success: true, errors: {} };
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    let message = 'An unexpected error occurred.';
    if(error.code === 'auth/user-not-found') {
        message = 'User not found. Could not update profile.';
    }
    return {
      message: message,
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
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      shippingAddress: addressData,
      updatedAt: serverTimestamp(),
    });
    return { success: true, errors: {} };
  } catch (error: any) {
    return {
      message: 'An unexpected error occurred.',
      success: false,
      errors: {},
    };
  }
}

