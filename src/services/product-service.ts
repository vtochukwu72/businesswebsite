'use server';

import { getFirestore, FieldPath } from 'firebase-admin/firestore';
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

export async function getProductsByIds(productIds: string[]): Promise<Product[]> {
  if (!productIds || productIds.length === 0) {
    return [];
  }

  try {
    const productChunks: string[][] = [];
    for (let i = 0; i < productIds.length; i += 30) {
      productChunks.push(productIds.slice(i, i + 30));
    }

    const productPromises = productChunks.map(chunk => {
      return db.collection('products').where(FieldPath.documentId(), 'in', chunk).get();
    });

    const productSnapshots = await Promise.all(productPromises);

    const products: Product[] = [];
    productSnapshots.forEach(snapshot => {
      snapshot.docs.forEach(doc => {
        products.push({
          id: doc.id,
          ...serializeFirestoreData(doc.data()),
        } as Product);
      });
    });
    
    // The order of products is not guaranteed, so let's sort them
    // based on the original productIds array.
    const productMap = new Map(products.map(p => [p.id, p]));
    const sortedProducts = productIds.map(id => productMap.get(id)).filter((p): p is Product => p !== undefined);

    return sortedProducts;
  } catch (error) {
    console.error(`Error fetching products by IDs:`, error);
    return [];
  }
}
