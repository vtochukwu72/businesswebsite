'use server';

import { getSdks, initializeFirebase } from '@/firebase';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

const profileSchema = z.object({
  fname: z.string().min(1, 'First name is required'),
  lname: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

export async function updateProfile(
  userId: string,
  prevState: any,
  formData: FormData
) {
  if (!userId) {
    return { success: false, message: 'User not authenticated.' };
  }

  const values = Object.fromEntries(formData.entries());
  const parsed = profileSchema.safeParse(values);

  if (!parsed.success) {
    const errorMessages = Object.values(parsed.error.flatten().fieldErrors)
      .map((errors) => errors?.join(', '))
      .join(', ');
    return {
      success: false,
      message: 'Validation failed: ' + errorMessages,
    };
  }

  const { fname, lname, phone } = parsed.data;

  try {
    const { auth, firestore } = getSdks(initializeFirebase().firebaseApp);
    const user = auth.currentUser;

    if (user && user.uid === userId) {
      await updateAuthProfile(user, {
        displayName: `${fname} ${lname}`,
        // Note: updating phone number via client SDK requires verification flow
      });
    } else {
        // This case should ideally not happen if the UI is correctly protecting routes.
        // For server-side updates where the user isn't `auth.currentUser`, you'd need firebase-admin.
        // Since we removed it, we'll rely on the client user being present.
        throw new Error("User mismatch or not signed in on the server context for profile update.");
    }
    
    await updateDoc(doc(firestore, 'users', userId), {
      fname,
      lname,
      phoneNumber: phone,
      updatedAt: new Date(),
    });

    revalidatePath('/account');

    return { success: true, message: 'Profile updated successfully!' };
  } catch (error: any) {
    console.error('Profile update error:', error);
    return {
      success: false,
      message: error.message || 'Failed to update profile.',
    };
  }
}
