'use server';

import { addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';
import { getSdks } from '@/firebase';

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
    const { firestore } = getSdks();
    const contactsCollection = collection(firestore, 'contacts');

    await addDocumentNonBlocking(contactsCollection, {
      ...parsed.data,
      createdAt: serverTimestamp(),
    });

    return { success: true, errors: {} };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      errors: { _form: ['An unexpected error occurred.'] },
    };
  }
}
