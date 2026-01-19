
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample orders data. In a real app, this would come from a checkout process.
const sampleOrders = [
  {
    orderId: 'order-001',
    userId: 'customer-1-uid', // Fictional customer UID
    customerName: 'Alice Johnson',
    orderStatus: 'pending',
    grandTotal: 349.99,
    sellerId: 'seller-1', // From prod-1
    orderNumber: '1001'
  },
  {
    orderId: 'order-002',
    userId: 'customer-2-uid',
    customerName: 'Bob Williams',
    orderStatus: 'fulfilled',
    grandTotal: 199.99,
    sellerId: 'seller-2', // From prod-2
    orderNumber: '1002'
  },
  {
    orderId: 'order-003',
    userId: 'customer-1-uid',
    customerName: 'Alice Johnson',
    orderStatus: 'shipped',
    grandTotal: 120.00,
    sellerId: 'seller-2', // From prod-5
    orderNumber: '1003'
  },
  {
    orderId: 'order-004',
    userId: 'customer-3-uid',
    customerName: 'Charlie Brown',
    orderStatus: 'pending',
    grandTotal: 9.99,
    sellerId: 'seller-4', // From prod-6
    orderNumber: '1004'
  },
   {
    orderId: 'order-005',
    userId: 'customer-3-uid',
    customerName: 'Charlie Brown',
    orderStatus: 'cancelled',
    grandTotal: 15.99,
    sellerId: 'seller-3', // from prod-4
    orderNumber: '1005'
  },
];

async function populateOrders() {
  const batch = writeBatch(db);

  // Before populating orders, we need to ensure the vendor documents exist,
  // otherwise the subcollection path won't be valid.
  const uniqueSellerIds = [...new Set(sampleOrders.map(o => o.sellerId))];
  uniqueSellerIds.forEach(sellerId => {
      const vendorRef = doc(db, 'vendors', sellerId);
      // We set a placeholder document. In a real app, this would be created
      // during seller registration with full vendor details.
      batch.set(vendorRef, { storeName: `Store of ${sellerId}`, status: 'approved' }, { merge: true });
  });

  sampleOrders.forEach(order => {
    const { orderId, sellerId, ...orderData } = order;

    // 1. Create document in top-level /orders collection
    const orderRef = doc(db, 'orders', orderId);
    batch.set(orderRef, {
      ...orderData,
      createdAt: serverTimestamp(),
    });

    // 2. Create denormalized document in /vendors/{sellerId}/orders subcollection
    const vendorOrderRef = doc(db, 'vendors', sellerId, 'orders', orderId);
    batch.set(vendorOrderRef, {
      ...orderData,
      createdAt: serverTimestamp(),
    });
  });

  try {
    await batch.commit();
    console.log('Successfully populated orders collection and denormalized data for vendors!');
  } catch (error) {
    console.error('Error populating orders:', error);
  } finally {
    // Firebase connections can keep the script running. We need to exit explicitly.
    process.exit(0);
  }
}

populateOrders();
