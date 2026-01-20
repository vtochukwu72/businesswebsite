'use server';
import { z } from 'zod';
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/firebase/config';
import { revalidatePath } from 'next/cache';

const db = getFirestore(app);

const vendorSettingsSchema = z.object({
  vendorId: z.string().min(1),
  storeName: z.string().min(3, 'Store name must be at least 3 characters'),
  storeDescription: z.string().optional(),
  nin: z.string().min(11, 'NIN must be 11 digits').max(11, 'NIN must be 11 digits'),
  businessName: z.string().min(1, 'Business name is required'),
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

    const { vendorId, ...vendorData } = parsed.data;

    try {
        const vendorRef = doc(db, 'vendors', vendorId);
        await updateDoc(vendorRef, {
            storeName: vendorData.storeName,
            storeDescription: vendorData.storeDescription,
            nin: vendorData.nin,
            payoutDetails: {
                businessName: vendorData.businessName,
                accountNumber: vendorData.accountNumber,
                bankName: vendorData.bankName,
            },
        });
        
        revalidatePath('/seller/settings');
        return { success: true, errors: {}, message: 'Settings updated successfully!' };

    } catch (error) {
        return {
            success: false,
            message: 'An unexpected error occurred while updating settings.',
            errors: {},
        };
    }
}

    