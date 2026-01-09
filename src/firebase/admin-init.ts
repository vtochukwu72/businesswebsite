import { initializeApp, getApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { firebaseAdminConfig } from './admin-config';

// This function initializes and returns the Firebase Admin App instance.
// It ensures that the app is initialized only once.
function initializeAdminApp(): App {
  const apps = getApps();
  if (apps.length) {
    return getApp();
  }

  // Ensure environment variable is handled correctly
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!privateKey) {
    throw new Error('FIREBASE_PRIVATE_KEY environment variable is not set.');
  }

  return initializeApp({
    credential: cert({
      projectId: firebaseAdminConfig.projectId,
      clientEmail: firebaseAdminConfig.clientEmail,
      privateKey: privateKey,
    }),
  });
}

// Singleton instance of the Firebase Admin App
const adminApp = initializeAdminApp();

// Getter function for the Admin App
export function getAdminApp(): App {
  return adminApp;
}

// Getter function for the Admin Auth service
export function getAdminAuth(): Auth {
  return getAuth(adminApp);
}

// Getter function for the Admin Firestore service
export function getAdminFirestore(): Firestore {
  return getFirestore(adminApp);
}
