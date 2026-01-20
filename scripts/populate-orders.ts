
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config';
import type { Vendor } from '../src/lib/types';

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

// New detailed vendor data
const vendorDetails: Record<string, Partial<Vendor>> = {
  'seller-1': {
    id: 'seller-1',
    storeName: 'SoundWave Official Store',
    storeDescription: 'The official store for all SoundWave audio products. High-quality sound, guaranteed.',
    email: 'seller1@example.com',
    phone: '08012345671',
    address: '123 Audio Avenue, Lagos, Nigeria',
    status: 'pending',
    nin: '12345678901',
    payoutDetails: {
      businessName: 'SoundWave Nigeria Ltd.',
      accountNumber: '1234567890',
      bankName: 'First Bank',
    },
    storeLogo: 'https://picsum.photos/seed/logo1/200/200',
  },
  'seller-2': {
    id: 'seller-2',
    storeName: 'Timeless & QuickStep',
    storeDescription: 'Curated fashion and footwear for the modern individual.',
    email: 'seller2@example.com',
    phone: '08012345672',
    address: '456 Fashion Lane, Abuja, Nigeria',
    status: 'approved',
    nin: '23456789012',
    payoutDetails: {
      businessName: 'Timeless Fashion Co.',
      accountNumber: '0987654321',
      bankName: 'GTBank',
    },
    storeLogo: 'https://picsum.photos/seed/logo2/200/200',
  },
  'seller-3': {
    id: 'seller-3',
    storeName: 'PureLeaf Organics',
    storeDescription: 'Your source for fresh, organic groceries.',
    email: 'seller3@example.com',
    phone: '08012345673',
    address: '789 Farm Road, Port Harcourt, Nigeria',
    status: 'approved',
    nin: '34567890123',
    payoutDetails: {
      businessName: 'PureLeaf Foods',
      accountNumber: '1122334455',
      bankName: 'Zenith Bank',
    },
    storeLogo: 'https://picsum.photos/seed/logo3/200/200',
  },
  'seller-4': {
    id: 'seller-4',
    storeName: 'The Book Nook',
    storeDescription: 'Discover your next favorite book with us.',
    email: 'seller4@example.com',
    phone: '08012345674',
    address: '101 Read Street, Ibadan, Nigeria',
    status: 'approved',
    nin: '45678901234',
    payoutDetails: {
      businessName: 'The Book Nook Ltd.',
      accountNumber: '5544332211',
      bankName: 'UBA',
    },
    storeLogo: 'https://picsum.photos/seed/logo4/200/200',
  }
};


async function populateOrders() {
  const batch = writeBatch(db);

  // Before populating orders, we need to ensure the vendor documents exist,
  // otherwise the subcollection path won't be valid.
  const uniqueSellerIds = [...new Set(sampleOrders.map(o => o.sellerId))];
  
  uniqueSellerIds.forEach(sellerId => {
      const vendorRef = doc(db, 'vendors', sellerId);
      const details = vendorDetails[sellerId];
      if (details) {
        // Set complete details for vendors defined in vendorDetails
        batch.set(vendorRef, details, { merge: true });
      } else {
        // Fallback for any other sellers
        batch.set(vendorRef, { storeName: `Store of ${sellerId}`, status: 'approved' }, { merge: true });
      }
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
