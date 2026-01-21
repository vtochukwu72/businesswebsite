
import { initializeApp, getApps, getApp, type App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

// IMPORTANT: Do not expose this to the client-side.
// This is a server-only file.

let adminApp: App | undefined;

/**
 * Lazily initializes and returns the Firebase Admin App instance.
 * This function is idempotent, meaning it will only initialize the app once.
 */
export function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  const existingApp = getApps().find(app => app?.name === 'admin');
  if (existingApp) {
    adminApp = existingApp;
    return adminApp;
  }
  
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountString) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set. Admin SDK cannot be initialized.');
  }
    
  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    adminApp = initializeApp({
      credential: credential.cert(serviceAccount),
    }, 'admin');
    return adminApp;
  } catch (e: any) {
    throw new Error(`Failed to initialize admin app. Please check your FIREBASE_SERVICE_ACCOUNT. Error: ${e.message}`);
  }
}
