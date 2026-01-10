
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Ensure Firebase is initialized
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signupSchema = z.object({
  fname: z.string().min(1, 'First name is required'),
  lname: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'seller', 'admin', 'super_admin']),
});

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export async function signup(prevState: any, formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const parsed = signupSchema.safeParse(values);

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { email, password, fname, lname, role } = parsed.data;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      displayName: `${fname} ${lname}`,
      email,
      role,
      createdAt: new Date().toISOString(),
    });

    // Create session cookie
    const idToken = await user.getIdToken();
    cookies().set('session', idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });

    return { success: true, errors: {} };
  } catch (error: any) {
    let errorMessage = 'An unexpected error occurred.';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email address is already in use.';
    }
    return {
      message: errorMessage,
      success: false,
      errors: {},
    };
  }
}

export async function login(prevState: any, formData: FormData) {
    const values = Object.fromEntries(formData.entries());
    const parsed = loginSchema.safeParse(values);

    if (!parsed.success) {
        return {
            errors: parsed.error.flatten().fieldErrors,
            success: false,
        };
    }

    const { email, password } = parsed.data;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists() || userDoc.data().role !== 'seller') {
            return {
                message: 'Access Denied: Not a seller account.',
                success: false,
                errors: {},
            };
        }

        const idToken = await user.getIdToken();
        cookies().set('session', idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return { success: true, errors: {} };
    } catch (error: any) {
        let errorMessage = 'An unexpected error occurred.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid email or password.';
        }
        return {
            message: errorMessage,
            success: false,
            errors: {},
        };
    }
}
