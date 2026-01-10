
import { initializeApp, getApps, getApp, type App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

// IMPORTANT: Do not expose this to the client-side.
// This is a server-only file.

// It is safe to use a service account in a server-side environment.
// Do not use this in a client-side environment.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

let adminApp: App;

if (getApps().some(app => app.name === 'admin')) {
  adminApp = getApp('admin');
} else {
  adminApp = initializeApp({
    credential: credential.cert(serviceAccount),
  }, 'admin');
}

export function getAdminApp() {
    return adminApp;
}
