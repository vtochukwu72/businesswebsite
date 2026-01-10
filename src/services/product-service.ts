'use server';

import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { app } from '@/firebase/config';
import type { Product } from '@/lib/types';

const db = getFirestore(app);

export async function getProducts(): Promise<Product[]> {
  try {
    const productsCol = collection(db, 'products');
    const productSnapshot = await getDocs(productsCol);
    const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
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
      return { id: productSnap.id, ...productSnap.data() } as Product;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching product ${slug}: `, error);
    return null;
  }
}
