'use server';

import { addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { z } from 'zod';
import { getSdks } from '@/firebase';

const emailSchema = z.string().email('Invalid email address');

export async function addNewsletterSubscriber(prevState: any, formData: FormData) {
  const email = formData.get('email');

  const parsed = emailSchema.safeParse(email);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().formErrors.join(', '),
    };
  }

  try {
    const { firestore } = getSdks();
    const subscribersCollection = collection(firestore, 'newsletterSubscribers');

    // Check if email already exists
    const q = query(subscribersCollection, where('email', '==', parsed.data));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { success: false, error: 'This email is already subscribed.' };
    }

    await addDocumentNonBlocking(subscribersCollection, {
      email: parsed.data,
      createdAt: serverTimestamp(),
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return {
      success: false,
      error: 'An unexpected error occurred.',
    };
  }
}

    