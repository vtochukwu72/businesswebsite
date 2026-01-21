
import { initializeApp, getApps, getApp, type App } from 'firebase-admin/app';
import { credential, type ServiceAccount } from 'firebase-admin';

// IMPORTANT: Do not expose this to the client-side.
// This is a server-only file.

function getServiceAccount(): ServiceAccount {
  const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountStr) {
    try {
      const parsed = JSON.parse(serviceAccountStr);
      // Vercel might escape newlines, so we replace them back.
      if (parsed.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
      }
      return parsed;
    } catch (e: any) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:', e.message);
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is malformed.');
    }
  }

  try {
    // Fallback for local development
    return require('../../service-account.json.json');
  } catch (e: any) {
    // This error is expected if the file doesn't exist on deployment
    // A more user-friendly error is thrown by getAdminApp if no credentials are found.
  }

  throw new Error('Could not find service account credentials. Ensure FIREBASE_SERVICE_ACCOUNT is set for production, or a service-account.json.json file exists for local development.');
}


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
  
  try {
    const serviceAccount = getServiceAccount();
    adminApp = initializeApp({
      credential: credential.cert(serviceAccount),
    }, 'admin');
    return adminApp;
  } catch (e: any) {
    // This will now catch errors from getServiceAccount() as well
    throw new Error(`Failed to initialize Firebase Admin SDK. ${e.message}`);
  }
}
