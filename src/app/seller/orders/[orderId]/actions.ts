'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(vendorId: string, orderId: string, newStatus: string) {
    if (!vendorId || !orderId || !newStatus) {
        return { success: false, message: 'Missing required parameters.' };
    }
    
    try {
        const db = getFirestore(getAdminApp());
        const batch = db.batch();

        const vendorOrderRef = db.collection('vendors').doc(vendorId).collection('orders').doc(orderId);
        const mainOrderRef = db.collection('orders').doc(orderId);
        
        const vendorOrderSnap = await vendorOrderRef.get();
        if (!vendorOrderSnap.exists || vendorOrderSnap.data()?.vendorId !== vendorId) {
             return { success: false, message: 'Authorization error. You do not own this order.' };
        }

        batch.update(vendorOrderRef, { orderStatus: newStatus });
        batch.update(mainOrderRef, { orderStatus: newStatus });
        
        await batch.commit();
        
        revalidatePath(`/seller/orders/${orderId}`);
        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/account/orders');

        return { success: true, message: `Order status updated to ${newStatus}.` };
    } catch (error: any) {
        console.error("Error updating order status:", error);
        return { success: false, message: error.message || 'An error occurred while updating order status.' };
    }
}
