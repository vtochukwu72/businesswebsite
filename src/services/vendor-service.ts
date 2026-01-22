'use server';

import { getFirestore, doc, getDoc, collection, getDocs, query, type DocumentSnapshot } from 'firebase/firestore';
import { app } from '@/firebase/config';
import type { Vendor } from '@/lib/types';

const db = getFirestore(app);

// Recursively find and convert all Firestore Timestamp objects to ISO strings.
const serializeObject = (obj: any): any => {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
        return obj;
    }

    // Check if it's a Firestore Timestamp
    if (obj.toDate && typeof obj.toDate === 'function') {
        return obj.toDate().toISOString();
    }

    // If it's an array, serialize each item
    if (Array.isArray(obj)) {
        return obj.map(serializeObject);
    }
    
    // If it's an object, serialize each value
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = serializeObject(obj[key]);
        }
    }
    return newObj;
}

// Helper to serialize an entire vendor document
function serializeVendor(doc: DocumentSnapshot): Vendor {
    const data = doc.data();
    if (!data) {
        // This should not happen for an existing doc, but as a safeguard.
        return { id: doc.id } as Vendor;
    }
    return { id: doc.id, ...serializeObject(data) } as Vendor;
}


export async function getVendor(vendorId: string): Promise<Vendor | null> {
  if (!vendorId) return null;
  try {
    const vendorRef = doc(db, 'vendors', vendorId);
    const vendorSnap = await getDoc(vendorRef);
    if (vendorSnap.exists()) {
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
    const vendorsCol = collection(db, 'vendors');
    const q = query(vendorsCol);
    const vendorSnapshot = await getDocs(q);
    const vendorList = vendorSnapshot.docs.map(serializeVendor);
    return vendorList;
  } catch (error) {
    console.error("Error fetching vendors: ", error);
    return [];
  }
}
