'use server';

import { revalidatePath } from 'next/cache';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';

interface ReviewPayload {
    vendorId: string;
    decision: 'approved' | 'rejected';
    riskScore: number;
    justification: string;
    adminUserId: string;
}

export async function reviewVendor({ vendorId, decision, riskScore, justification, adminUserId }: ReviewPayload) {
    if (!vendorId || !decision) {
        return { success: false, message: 'Vendor ID and decision are required.' };
    }
    
    try {
        const adminApp = getAdminApp();
        const db = getFirestore(adminApp);
        
        const vendorRef = db.collection('vendors').doc(vendorId);

        await vendorRef.update({
            status: decision,
            'compliance.riskScore': riskScore,
            'compliance.justification': justification,
            'compliance.reviewedBy': adminUserId,
            'compliance.reviewedAt': FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        revalidatePath('/admin/vendors');
        return { success: true, message: `Vendor has been ${decision}.` };

    } catch (error: any) {
        console.error('Error reviewing vendor:', error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}

    