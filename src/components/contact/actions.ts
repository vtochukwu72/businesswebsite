'use server';

import { z } from 'zod';

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

  console.log('New contact message:', parsed.data);

  // This is a static implementation. In a real app, you would save this to a database.
  // For now, we just simulate a successful submission.
  return { success: true, errors: {} };
}
