'use server';

import { z } from 'zod';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';

const emailSchema = z.string().email('Invalid email address');

export async function addNewsletterSubscriber(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;

  const parsed = emailSchema.safeParse(email);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().formErrors.join(', '),
      message: null,
    };
  }

  try {
    const db = getFirestore(getAdminApp());
    const subscribersRef = db.collection('newsletterSubscribers');
    
    // Check if email already exists
    const existingSub = await subscribersRef.where('email', '==', parsed.data).limit(1).get();
    if (!existingSub.empty) {
        return { success: true, error: null, message: 'You are already subscribed!' };
    }

    // Add new subscriber
    const docRef = subscribersRef.doc(); // Create a reference with an auto-generated ID
    await docRef.set({
      id: docRef.id,
      email: parsed.data,
      createdAt: FieldValue.serverTimestamp(),
    });


  } catch (error: any) {
    console.error("Error subscribing to newsletter:", error);
    // Hide specific server errors from the client
    return {
      success: false,
      error: 'An unexpected server error occurred. Please try again later.',
      message: null,
    };
  }

  return { success: true, error: null, message: 'You have been successfully subscribed!' };
}
