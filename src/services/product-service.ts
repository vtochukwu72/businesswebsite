'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/firebase/admin-config';
import type { Product } from '@/lib/types';
import { serializeFirestoreData } from '@/lib/utils';

const db = getFirestore(getAdminApp());

export async function getProducts(): Promise<Product[]> {
  try {
    const productsCol = db.collection('products');
    const productSnapshot = await productsCol.get();
    const productList = productSnapshot.docs.map(doc => {
      const data = doc.data();
      const serializedData = serializeFirestoreData(data);
      return { id: doc.id, ...serializedData } as Product;
    });
    return productList;
  } catch (error) {
    console.error("Error fetching products: ", error);
    return [];
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const productRef = db.collection('products').doc(slug);
    const productSnap = await productRef.get();
    if (productSnap.exists) {
      const data = productSnap.data();
      const serializedData = serializeFirestoreData(data);
      return { id: productSnap.id, ...serializedData } as Product;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching product ${slug}: `, error);
    return null;
  }
}

export async function getProductsBySeller(sellerId: string): Promise<Product[]> {
  try {
    const productsCol = db.collection('products');
    const q = productsCol.where('sellerId', '==', sellerId);
    const productSnapshot = await q.get();
    const productList = productSnapshot.docs.map(doc => {
      const data = doc.data();
      const serializedData = serializeFirestoreData(data);
      return { id: doc.id, ...serializedData } as Product;
    });
    return productList;
  } catch (error) {
    console.error(`Error fetching products for seller ${sellerId}: `, error);
    return [];
  }
}
