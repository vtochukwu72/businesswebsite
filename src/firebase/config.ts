// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyAx76XZFjtjDP7j-xLizSs9sTV_kmF3Imk",
  authDomain: "e-commerce-936b5.firebaseapp.com",
  projectId: "e-commerce-936b5",
  storageBucket: "e-commerce-936b5.appspot.com",
  messagingSenderId: "84391388232",
  appId: "1:84391388232:web:cbf2ca7870f51bd522e47d",
  measurementId: "G-LLSFPMWG37"
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}


// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Optional

export { app, auth, db, storage };
