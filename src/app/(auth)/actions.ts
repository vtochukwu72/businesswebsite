'use server';

import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  FieldValue,
  doc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { cookies } from 'next/headers';
import { getSdks, initializeFirebase } from '@/firebase';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as updateAuthProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getAdminApp, getAdminAuth } from '@/firebase/admin-init';
import { redirect } from 'next/navigation';

const signupSchema = z
  .object({
    fname: z.string().min(1, 'First name is required'),
    lname: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    userType: z.enum(['customer', 'vendor', 'admin']),
    storeName: z.string().optional(),
    accountNumber: z.string().optional(),
    nin: z.string().optional(),
    adminCode: z.string().optional(),
    sellerCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export async function signup(prevState: any, formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const parsed = signupSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Please correct the errors below.',
    };
  }

  const {
    email,
    password,
    fname,
    lname,
    phone,
    userType,
    storeName,
    accountNumber,
    nin,
    adminCode,
    sellerCode,
  } = parsed.data;

  try {
    if (userType === 'vendor') {
      if (!storeName)
        return { success: false, message: 'Store name is required' };
      if (!accountNumber)
        return { success: false, message: 'Account number is required' };
      if (!nin) return { success: false, message: 'NIN is required' };
      if (sellerCode !== 'SELLER_SECRET')
        return { success: false, message: 'Invalid seller registration code' };
    }
    if (userType === 'admin') {
      if (adminCode !== 'ADMIN_SECRET_2024')
        return { success: false, message: 'Invalid admin registration code' };
    }

    const { auth, firestore } = getSdks(initializeFirebase().firebaseApp);

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const userRecord = userCredential.user;
    
    await updateAuthProfile(userRecord, {
        displayName: `${fname} ${lname}`
    })

    const userData: any = {
      userId: userRecord.uid,
      email: email,
      fname: fname,
      lname: lname,
      phoneNumber: phone || '',
      role: userType,
      emailVerified: false,
      phoneVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
      status: 'active',
    };

    if (userType === 'vendor') {
      userData.storeName = storeName;
      userData.accountNumber = accountNumber;
      userData.nin = nin;
      userData.verificationStatus = {
        idVerified: false,
        bankVerified: false,
        ninVerified: false,
        verifiedBy: null,
        verifiedAt: null,
      };
      userData.businessInfo = {
        businessName: storeName,
        taxId: '',
        businessType: 'individual',
        registrationNumber: '',
      };
      userData.storeSettings = {
        storeSlug: storeName?.toLowerCase().replace(/\s+/g, '-'),
        storeDescription: '',
        storeLogo: '',
        storeBanner: '',
        storeContact: {
          address: '',
          city: '',
          state: '',
          country: '',
        },
      };
      userData.commissionRate = 10;
      userData.status = 'pending_verification';
    }

    if (userType === 'admin') {
      userData.permissions = ['read', 'write', 'delete'];
      userData.adminLevel = 'admin';
      userData.lastActivity = new Date();
      userData.ipWhitelist = [];
      userData.twoFactorEnabled = false;
    }

    await setDoc(doc(firestore, 'users', userRecord.uid), userData);
    
    if (userType === 'vendor') {
      await setDoc(doc(firestore, 'vendors', userRecord.uid), {
        id: userRecord.uid,
        storeName: storeName,
        status: 'pending',
        storeDescription: '',
        email: email,
      });
    }

    // After successful signup, we can automatically log the user in
    // by creating a session cookie.
    const idToken = await userRecord.getIdToken();
    const adminAuth = getAdminAuth();
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    cookies().set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn / 1000,
      path: '/',
      sameSite: 'lax'
    });


  } catch (error: any) {
    console.error('Signup error:', error);
    let message = error.message || 'Failed to create account.';
    if (error.code === 'auth/email-already-in-use') {
        message = 'This email address is already in use by another account.';
    }
    return {
      success: false,
      message,
    };
  }

  // Redirect after successful sign-up and session creation
  if (userType === 'admin') {
    redirect('/admin');
  }
  if (userType === 'vendor') {
    redirect('/seller');
  }
  redirect('/account');
}

const loginSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
});

export async function login(prevState: any, formData: FormData) {
  const values = Object.fromEntries(formData.entries());
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Please provide a valid token.',
    };
  }

  const { idToken } = parsed.data;

  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    const { firestore } = getSdks(initializeFirebase().firebaseApp);
    await updateDoc(doc(firestore, 'users', uid), {
      lastLogin: new Date(),
      status: 'active'
    });
    
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    cookies().set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn / 1000, // maxAge is in seconds
      path: '/',
      sameSite: 'lax'
    });
    
    revalidatePath('/', 'layout');

    return { success: true, message: 'Login successful!' };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, message: error.message || 'Login failed. Please try again.' };
  }
}

export async function forgotPassword(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  if (!email) {
    return { success: false, message: 'Please enter your email address.' };
  }

  try {
    const { auth } = getSdks(initializeFirebase().firebaseApp);
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'Password reset email sent! Check your inbox.',
    };
  } catch (error: any) {
    console.error('Password reset error:', error);
    // Don't reveal if the user exists or not
    return {
      success: true,
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }
}

export async function logout() {
  cookies().delete('session');
  revalidatePath('/', 'layout');
}
