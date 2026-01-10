import { initializeApp, getApp, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This function initializes and returns the Firebase Admin App instance.
// It ensures that the app is initialized only once.
function initializeAdminApp(): App {
  const apps = getApps();
  if (apps.length) {
    return getApp();
  }

  // When running in a Google Cloud environment (like App Hosting or Cloud Functions),
  // initializeApp() automatically discovers the service account credentials.
  // This removes the need for manual configuration or environment variables.
  return initializeApp();
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
