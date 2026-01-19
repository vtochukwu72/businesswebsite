'use server';

import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { app } from '@/firebase/config';
import type { Order } from '@/lib/types';

const db = getFirestore(app);

export async function getOrdersBySeller(sellerId: string): Promise<Order[]> {
  if (!sellerId) return [];
  try {
    const ordersCol = collection(db, 'vendors', sellerId, 'orders');
    const q = query(ordersCol, orderBy('createdAt', 'desc'));
    const orderSnapshot = await getDocs(q);
    
    if (orderSnapshot.empty) {
      console.log(`No orders found for seller ${sellerId}`);
      return [];
    }

    const orderList = orderSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            // Convert Firestore Timestamp to Date if it exists
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as Order;
    });
    return orderList;
  } catch (error) {
    console.error(`Error fetching orders for seller ${sellerId}: `, error);
    return [];
  }
}
