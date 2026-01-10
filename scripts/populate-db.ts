import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch } from 'firebase/firestore';
import { products } from '../src/lib/static-data';
import { firebaseConfig } from '../src/firebase/config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function populateProducts() {
  const productsCollection = collection(db, 'products');
  const batch = writeBatch(db);

  products.forEach((product) => {
    // We are using the static product ID as the document ID
    const docRef = collection(productsCollection, product.id);
    // The static data has `id` as a field, but we don't need to store it in the document
    // as it's the document's ID.
    const { id, ...productData } = product; 
    batch.set(docRef, productData);
  });

  try {
    await batch.commit();
    console.log('Successfully populated products collection!');
  } catch (error) {
    console.error('Error populating products:', error);
  } finally {
    // Firebase connections can keep the script running. We need to exit explicitly.
    process.exit(0);
  }
}

populateProducts();
