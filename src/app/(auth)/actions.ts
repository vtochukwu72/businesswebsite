
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
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
    role: z.enum(['customer', 'seller', 'admin', 'super_admin']).optional(),
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
  const displayName = `${fname} ${lname}`;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update profile in Auth
    await updateProfile(user, {
        displayName: displayName
    });

    // Create user profile in Firestore with more details
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      email: user.email,
      fname: fname,
      lname: lname,
      displayName: displayName,
      phone: "",
      address: {},
      photoURL: user.photoURL,
      role,
      emailVerified: user.emailVerified,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      cart: [],
      wishlist: [],
      orders: [],
      shippingAddresses: [],
      preferences: {
        newsletter: false,
        marketingEmails: false
      }
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

    const { email, password, role } = parsed.data;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
             return {
                message: 'User data not found.',
                success: false,
                errors: {},
            };
        }
        
        const userData = userDoc.data();

        // If a role is specified for login (e.g., for seller or admin portals), check it.
        if (role) {
            const allowedRoles = role === 'admin' ? ['admin', 'super_admin'] : [role];
            if (!allowedRoles.includes(userData.role)) {
                 return {
                    message: `Access Denied: Not a ${role} account.`,
                    success: false,
                    errors: {},
                };
            }
        }


        const idToken = await user.getIdToken();
        cookies().set('session', idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return { success: true, role: userData.role, errors: {} };
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


export async function signInWithGoogle(idToken: string) {
    // This function will be called from the client after Google sign-in
    // It's responsible for setting the session cookie.
    try {
        cookies().set('session', idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });
        
        return { success: true };
    } catch(error) {
        return { success: false, message: 'Could not create session.' };
    }
}
