'use server';

import { getFirestore, doc, getDoc, updateDoc, collection, getDocs, query } from 'firebase/firestore';
import { app } from '@/firebase/config';
import type { Vendor } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const db = getFirestore(app);

export async function getVendor(vendorId: string): Promise<Vendor | null> {
  if (!vendorId) return null;
  try {
    const vendorRef = doc(db, 'vendors', vendorId);
    const vendorSnap = await getDoc(vendorRef);
    if (vendorSnap.exists()) {
      return { id: vendorSnap.id, ...vendorSnap.data() } as Vendor;
    } else {
      console.log(`No vendor document found for ${vendorId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching vendor ${vendorId}: `, error);
    return null;
  }
}

export async function getVendors(): Promise<Vendor[]> {
  try {
    const vendorsCol = collection(db, 'vendors');
    const q = query(vendorsCol);
    const vendorSnapshot = await getDocs(q);
    const vendorList = vendorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vendor));
    return vendorList;
  } catch (error) {
    console.error("Error fetching vendors: ", error);
    return [];
  }
}

    