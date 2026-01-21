'use server';
import { z } from 'zod';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';
import { revalidatePath } from 'next/cache';

const vendorSettingsSchema = z.object({
  vendorId: z.string().min(1),
  storeName: z.string().min(3, 'Store name must be at least 3 characters'),
  storeDescription: z.string().optional(),
  nin: z.string().min(11, 'NIN must be 11 digits').max(11, 'NIN must be 11 digits'),
  businessName: z.string().min(1, 'Account name is required'),
  accountNumber: z.string().min(10, 'Account number must be 10 digits').max(10, 'Account number must be 10 digits'),
  bankName: z.string().min(1, 'Bank name is required'),
});

export async function updateVendorSettings(prevState: any, formData: FormData) {
    const values = Object.fromEntries(formData.entries());
    const parsed = vendorSettingsSchema.safeParse(values);

    if (!parsed.success) {
        return {
            success: false,
            errors: parsed.error.flatten().fieldErrors,
        };
    }

    const { vendorId, storeName, storeDescription, nin, businessName, accountNumber, bankName } = parsed.data;

    try {
        const adminApp = getAdminApp();
        const db = getFirestore(adminApp);
        const vendorRef = db.collection('vendors').doc(vendorId);

        await vendorRef.update({
            storeName,
            storeDescription,
            nin,
            payoutDetails: {
                businessName,
                accountNumber,
                bankName,
            },
            updatedAt: FieldValue.serverTimestamp(),
        });
        
        revalidatePath('/seller/settings');
        return { success: true, errors: {}, message: 'Settings updated successfully!' };

    } catch (error: any) {
        console.error("Error updating vendor settings:", error);
        return {
            success: false,
            message: 'An unexpected error occurred while updating settings.',
            errors: {},
        };
    }
}
