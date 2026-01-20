'use server';

import { revalidatePath } from 'next/cache';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from '@/firebase/config';

const db = getFirestore(app);

export async function updateVendorStatus(
  vendorId: string,
  status: 'approved' | 'suspended' | 'pending'
) {
  if (!vendorId) {
    return { success: false, message: 'Vendor ID is required.' };
  }

  try {
    const vendorRef = doc(db, 'vendors', vendorId);
    await updateDoc(vendorRef, { status });
    revalidatePath('/admin/vendors');
    return { success: true, message: `Vendor status updated to ${status}.` };
  } catch (error: any) {
    console.error(`Error updating vendor status for ${vendorId}: `, error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred.',
    };
  }
}

    