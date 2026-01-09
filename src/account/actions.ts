'use server';

import { initAdmin } from '@/firebase/admin-init';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const profileSchema = z.object({
  fname: z.string().min(1, 'First name is required'),
  lname: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

export async function updateProfile(userId: string, prevState: any, formData: FormData) {
  if (!userId) {
    return { success: false, message: 'User not authenticated.' };
  }
  
  const values = Object.fromEntries(formData.entries());
  const parsed = profileSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed: ' + parsed.error.flatten().fieldErrors,
    };
  }

  const { fname, lname, phone } = parsed.data;

  try {
    const { auth, db } = await initAdmin();

    await auth.updateUser(userId, {
      displayName: `${fname} ${lname}`,
      phoneNumber: phone,
    });
    
    await db.collection('users').doc(userId).update({
      fname,
      lname,
      phoneNumber: phone,
      updatedAt: new Date(),
    });

    revalidatePath('/account');

    return { success: true, message: 'Profile updated successfully!' };
  } catch (error: any) {
    console.error('Profile update error:', error);
    return { success: false, message: error.message || 'Failed to update profile.' };
  }
}
