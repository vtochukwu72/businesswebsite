'use server';

import { getFirestore, type DocumentSnapshot } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';
import type { Vendor } from '@/lib/types';
import { serializeFirestoreData } from '@/lib/utils';

const db = getFirestore(getAdminApp());

function serializeVendor(doc: DocumentSnapshot): Vendor {
    const data = doc.data();
    if (!data) {
        // This should not happen for an existing doc, but as a safeguard.
        return { id: doc.id } as Vendor;
    }
    return { id: doc.id, ...serializeFirestoreData(data) } as Vendor;
}


export async function getVendor(vendorId: string): Promise<Vendor | null> {
  if (!vendorId) return null;
  try {
    const vendorRef = db.collection('vendors').doc(vendorId);
    const vendorSnap = await vendorRef.get();
    if (vendorSnap.exists) {
      return serializeVendor(vendorSnap);
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
    const vendorsCol = db.collection('vendors');
    const vendorSnapshot = await vendorsCol.get();
    const vendorList = vendorSnapshot.docs.map(serializeVendor);
    return vendorList;
  } catch (error) {
    console.error("Error fetching vendors: ", error);
    return [];
  }
}
