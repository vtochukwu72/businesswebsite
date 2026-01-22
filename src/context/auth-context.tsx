
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


// Ensure Firebase is initialized
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export interface AuthContextType {
  user: User | null;
  userData: DocumentData | null;
  vendorData: DocumentData | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  vendorData: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [vendorData, setVendorData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  // Step 1: Handle authentication state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (authUser) {
        setLoading(true); // Start loading process when user is found
      } else {
        // If no user, clear all data and stop loading
        setUserData(null);
        setVendorData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Step 2: Fetch user data when authUser is available
  useEffect(() => {
    if (!user) {
        return; // No user, so no data to fetch
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeFirestore = onSnapshot(
      userDocRef, 
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          // Sanitize Timestamps
          if (data.createdAt && data.createdAt.toDate) {
            data.createdAt = data.createdAt.toDate().toISOString();
          }
          if (data.updatedAt && data.updatedAt.toDate) {
            data.updatedAt = data.updatedAt.toDate().toISOString();
          }

          setUserData(data);
          // If the user is NOT a seller, we have all their data, so we can stop loading.
          if (data.role !== 'seller') {
            setVendorData(null);
            setLoading(false);
          }
        } else {
          // User document doesn't exist.
          setUserData(null);
          setLoading(false);
        }
      }, 
      (error) => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'get',
        }, error);
        errorEmitter.emit('permission-error', permissionError);

        console.error('Error fetching user data:', error);
        setUserData(null);
        setLoading(false);
      }
    );

    return () => unsubscribeFirestore();
  }, [user]);

  // Step 3: Fetch vendor data only if the user is a seller
  useEffect(() => {
    if (!user || !userData) {
      // Don't do anything if we don't have user or userData yet
      return;
    }

    if (userData.role === 'seller') {
      const vendorDocRef = doc(db, 'vendors', user.uid);
      const unsubscribeVendor = onSnapshot(vendorDocRef, (vendorDoc) => {
        if (vendorDoc.exists()) {
          const data = vendorDoc.data();
          // Sanitize Timestamps before setting state
          if (data.createdAt && data.createdAt.toDate) {
            data.createdAt = data.createdAt.toDate().toISOString();
          }
          if (data.updatedAt && data.updatedAt.toDate) {
            data.updatedAt = data.updatedAt.toDate().toISOString();
          }
          if (
            data.compliance &&
            data.compliance.reviewedAt &&
            data.compliance.reviewedAt.toDate
          ) {
            data.compliance.reviewedAt = data.compliance.reviewedAt
              .toDate()
              .toISOString();
          }
          setVendorData(data);
        } else {
          setVendorData(null);
        }
        setLoading(false); // Loading is complete for the seller
      }, (error) => {
        const permissionError = new FirestorePermissionError({
          path: vendorDocRef.path,
          operation: 'get',
        }, error);
        errorEmitter.emit('permission-error', permissionError);

        console.error('Error fetching vendor data:', error);
        setVendorData(null);
        setLoading(false);
      });

      return () => unsubscribeVendor();
    }
    // If user is not a seller, the previous useEffect already handled setting loading to false.
  }, [user, userData]);


  const logout = async () => {
    try {
      // Clear session cookie first (don't wait for it)
      fetch('/api/logout', { method: 'POST' }).catch(() => {
        // Ignore errors - session will expire anyway
      });
      
      // Sign out from Firebase
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, try to sign out anyway
      try {
        await signOut(auth);
      } catch (e) {
        console.error('Force signout error:', e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, vendorData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
