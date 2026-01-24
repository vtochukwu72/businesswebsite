'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';
import type { Order } from '@/lib/types';
import { serializeFirestoreData } from '@/lib/utils';

const db = getFirestore(getAdminApp());

export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!orderId) return null;
  try {
    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();
    
    if (orderSnap.exists) {
      const data = orderSnap.data();
      return { 
          id: orderSnap.id, 
          ...serializeFirestoreData(data),
      } as Order;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching order ${orderId}: `, error);
    return null;
  }
}

export async function getOrdersBySeller(sellerId: string): Promise<Order[]> {
  if (!sellerId) return [];
  try {
    const ordersCol = db.collection('vendors').doc(sellerId).collection('orders');
    const q = ordersCol.orderBy('createdAt', 'desc');
    const orderSnapshot = await q.get();
    
    if (orderSnapshot.empty) {
      console.log(`No orders found for seller ${sellerId}`);
      return [];
    }

    const orderList = orderSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...serializeFirestoreData(data),
        } as Order;
    });
    return orderList;
  } catch (error) {
    console.error(`Error fetching orders for seller ${sellerId}: `, error);
    return [];
  }
}

export async function getAllOrders(count?: number): Promise<Order[]> {
  try {
    let q: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection('orders').orderBy('createdAt', 'desc');
    if (count) {
      q = q.limit(count);
    }
    
    const orderSnapshot = await q.get();
    const orderList = orderSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...serializeFirestoreData(data),
      } as Order;
    });
    return orderList;
  } catch (error) {
    console.error("Error fetching all orders: ", error);
    return [];
  }
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  if (!userId) return [];
  try {
    const ordersCol = db.collection('orders');
    const q = ordersCol.where('userId', '==', userId).orderBy('createdAt', 'desc');
    const orderSnapshot = await q.get();
    
    if (orderSnapshot.empty) {
      return [];
    }

    const orderList = orderSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...serializeFirestoreData(data),
        } as Order;
    });
    return orderList;
  } catch (error) {
    console.error(`Error fetching orders for user ${userId}: `, error);
    return [];
  }
}
