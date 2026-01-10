'use server';

import { z } from 'zod';

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

  console.log(`New newsletter subscriber: ${parsed.data}`);

  // This is a static implementation. In a real app, you would save this to a database.
  // For now, we just simulate a successful subscription.
  
  return { success: true, error: null };
}
