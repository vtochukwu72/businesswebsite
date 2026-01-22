'use server';

import { getFirestore, collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { app } from '@/firebase/config';
import type { Product } from '@/lib/types';
import { serializeFirestoreData } from '@/lib/utils';

const db = getFirestore(app);

export async function getProducts(): Promise<Product[]> {
  try {
    const productsCol = collection(db, 'products');
    const productSnapshot = await getDocs(productsCol);
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
    const productRef = doc(db, 'products', slug);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
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
    const productsCol = collection(db, 'products');
    const q = query(productsCol, where('sellerId', '==', sellerId));
    const productSnapshot = await getDocs(q);
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
