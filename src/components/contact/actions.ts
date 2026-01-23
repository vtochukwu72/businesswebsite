'use server';

import { z } from 'zod';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function addContactMessage(prevState: any, formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const parsed = contactSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const db = getFirestore(getAdminApp());
    await db.collection('contacts').add({
      ...parsed.data,
      createdAt: FieldValue.serverTimestamp(),
      isRead: false, // Default to unread
    });
    return { success: true, errors: {} };
  } catch (error) {
    console.error('Error saving contact message:', error);
    return {
      success: false,
      errors: { _form: ['An unexpected error occurred. Please try again.'] },
    };
  }
}
