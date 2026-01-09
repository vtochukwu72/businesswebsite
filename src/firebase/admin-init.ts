import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

async function getServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch (e) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT_KEY', e);
      return undefined;
    }
  }
  return undefined;
}

export async function initAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = await getServiceAccount();
    if (serviceAccount) {
      app = initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      // This will use the default service account in GCP environments
      app = initializeApp();
    }
  } else {
    app = getApps()[0];
  }

  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
  };
}
