
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { useRouter } from 'next/navigation';

// Ensure Firebase is initialized
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

interface AuthContextType {
  user: User | null;
  userData: DocumentData | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribeFirestore = onSnapshot(
        userDocRef, 
        (doc) => {
          if (doc.exists()) {
            setUserData(doc.data());
          } else {
            setUserData(null);
          }
          setLoading(false);
        }, 
        (error) => {
          console.error('Error fetching user data:', error);
          setUserData(null);
          setLoading(false);
        }
      );

      return () => unsubscribeFirestore();
    }
  }, [user]);

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
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
