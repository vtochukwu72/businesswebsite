'use server';

import { revalidatePath } from 'next/cache';
import { getFirestore, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { app } from '@/firebase/config';

const db = getFirestore(app);

export async function toggleMessageReadStatus(messageId: string, currentStatus: boolean) {
  if (!messageId) {
    return { success: false, message: 'Message ID is required.' };
  }
  try {
    const messageRef = doc(db, 'contacts', messageId);
    await updateDoc(messageRef, { isRead: !currentStatus });
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
    await deleteDoc(doc(db, 'contacts', messageId));
    revalidatePath('/admin/messages');
    return { success: true, message: 'Message deleted successfully.' };
  } catch (error: any) {
    console.error('Error deleting message:', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
