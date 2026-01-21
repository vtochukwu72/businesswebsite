'use server';
import { revalidatePath } from 'next/cache';
import { getAdminApp } from '@/firebase/admin-config';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export async function deleteUser(userId: string) {
  if (!userId) {
    return { success: false, message: 'User ID is required.' };
  }

  try {
    const adminApp = getAdminApp();
    if (!adminApp) {
        throw new Error('Admin SDK not initialized.');
    }
    const adminAuth = getAuth(adminApp);
    const adminDb = getFirestore(adminApp);

    // 1. Delete from Firebase Authentication
    await adminAuth.deleteUser(userId);

    // 2. Delete user document from /users
    await adminDb.collection('users').doc(userId).delete();

    // 3. If the user is a vendor, delete their document from /vendors as well
    const vendorRef = adminDb.collection('vendors').doc(userId);
    const vendorDoc = await vendorRef.get();
    if (vendorDoc.exists) {
      await vendorRef.delete();
    }
    
    revalidatePath('/admin/customers');
    return { success: true, message: 'User has been successfully deleted.' };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred while deleting the user.',
    };
  }
}
