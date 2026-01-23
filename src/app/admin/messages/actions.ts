'use server';

import { revalidatePath } from 'next/cache';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';


export async function toggleMessageReadStatus(messageId: string, currentStatus: boolean) {
  if (!messageId) {
    return { success: false, message: 'Message ID is required.' };
  }
  try {
    const db = getFirestore(getAdminApp());
    const messageRef = db.collection('contacts').doc(messageId);
    await messageRef.update({ isRead: !currentStatus });
    revalidatePath('/admin/messages');
    return { success: true, message: `Message marked as ${!currentStatus ? 'unread' : 'read'}.` };
  } catch (error: any) {
    console.error('Error updating message status:', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}

export async function deleteMessage(messageId: string) {
  if (!messageId) {
    return { success: false, message: 'Message ID is required.' };
  }
  try {
    const db = getFirestore(getAdminApp());
    await db.collection('contacts').doc(messageId).delete();
    revalidatePath('/admin/messages');
    return { success: true, message: 'Message deleted successfully.' };
  } catch (error: any) {
    console.error('Error deleting message:', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
