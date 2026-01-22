'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';
import type { User } from '@/lib/types';
import { getOrdersBySeller } from './order-service';
import { serializeFirestoreData } from '@/lib/utils';

const db = getFirestore(getAdminApp());

export async function getUsers(count?: number): Promise<User[]> {
  try {
    const usersCol = db.collection('users');
    let q: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = usersCol.orderBy('createdAt', 'desc');
    if (count) {
      q = q.limit(count);
    }
    
    const userSnapshot = await q.get();
    const userList = userSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...serializeFirestoreData(data),
      } as User;
    });
    return userList;
  } catch (error) {
    console.error("Error fetching users: ", error);
    return [];
  }
}


export async function getCustomersForSeller(sellerId: string): Promise<User[]> {
  if (!sellerId) return [];
  try {
    const sellerOrders = await getOrdersBySeller(sellerId);
    if (sellerOrders.length === 0) {
      return [];
    }

    const customerIds = [...new Set(sellerOrders.map(order => order.userId))];

    if (customerIds.length === 0) {
        return [];
    }

    // Firestore 'in' query is limited to 30 elements.
    // We need to chunk the requests if there are more.
    const customerChunks: string[][] = [];
    for (let i = 0; i < customerIds.length; i += 30) {
      customerChunks.push(customerIds.slice(i, i + 30));
    }

    const customerPromises = customerChunks.map(chunk => {
      const usersCol = db.collection('users');
      // The `id` field in the user document is the same as the doc id (uid)
      const q = usersCol.where('id', 'in', chunk);
      return q.get();
    });

    const customerSnapshots = await Promise.all(customerPromises);

    const customers: User[] = [];
    customerSnapshots.forEach(snapshot => {
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        customers.push({
          id: doc.id,
          ...serializeFirestoreData(data),
        } as User);
      });
    });

    return customers;
  } catch (error) {
    console.error(`Error fetching customers for seller ${sellerId}:`, error);
    return [];
  }
}
