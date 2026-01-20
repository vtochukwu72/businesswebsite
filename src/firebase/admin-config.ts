
import { initializeApp, getApps, getApp, type App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

// IMPORTANT: Do not expose this to the client-side.
// This is a server-only file.

function initializeAdminApp(): App | undefined {
    // Prevent re-initialization
    if (getApps().some(app => app.name === 'admin')) {
        return getApp('admin');
    }

    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
        console.warn('FIREBASE_SERVICE_ACCOUNT environment variable is not set. Admin SDK will not be initialized.');
        return undefined;
    }
    
    try {
        const serviceAccount = JSON.parse(serviceAccountString);
        return initializeApp({
            credential: credential.cert(serviceAccount),
        }, 'admin');
    } catch (e) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT or initialize admin app. Check your environment variables.', e);
        return undefined;
    }
}

const adminApp = initializeAdminApp();

export function getAdminApp() {
    if (!adminApp) {
        throw new Error('Firebase Admin SDK has not been initialized. Please ensure your FIREBASE_SERVICE_ACCOUNT environment variable is set correctly.');
    }
    return adminApp;
}
