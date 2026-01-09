'use server';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { initAdmin } from '@/firebase/admin-init';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

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
  } = parsed.data;

  try {
    if (userType === 'vendor') {
      if (!storeName)
        return { success: false, message: 'Store name is required' };
      if (!accountNumber)
        return { success: false, message: 'Account number is required' };
      if (!nin) return { success: false, message: 'NIN is required' };
    }
    if (userType === 'admin') {
      if (!nin) return { success: false, message: 'NIN is required' };
      if (adminCode !== 'ADMIN_SECRET_2024')
        return { success: false, message: 'Invalid admin registration code' };
    }

    const { auth, db } = await initAdmin();

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${fname} ${lname}`,
      phoneNumber: phone,
    });

    const userData: any = {
      userId: userRecord.uid,
      email: email,
      fname: fname,
      lname: lname,
      phoneNumber: phone || '',
      role: userType,
      emailVerified: false,
      phoneVerified: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastLogin: FieldValue.serverTimestamp(),
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
      userData.nin = nin;
      userData.permissions = ['read', 'write', 'delete'];
      userData.adminLevel = 'admin';
      userData.lastActivity = FieldValue.serverTimestamp();
      userData.ipWhitelist = [];
      userData.twoFactorEnabled = false;
    }

    await db.collection('users').doc(userRecord.uid).set(userData);

    if (userType === 'vendor') {
      await db.collection('vendors').doc(userRecord.uid).set({
        id: userRecord.uid,
        storeName: storeName,
        status: 'pending',
        storeDescription: '',
        email: email,
      });
    }

    return {
      success: true,
      message: 'Account created successfully!',
    };
  } catch (error: any) {
    console.error('Signup error:', error);
    return {
      success: false,
      message: error.message || 'Failed to create account.',
    };
  }
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
    const { auth, db } = await initAdmin();
    const decodedToken = await auth.verifyIdToken(idToken);
    const userRecord = await auth.getUser(decodedToken.uid);

    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    if (!userDoc.exists) {
      return { success: false, message: 'User data not found.' };
    }
    const userData = userDoc.data();

    if (userData?.status === 'suspended') {
      return {
        success: false,
        message: 'Your account has been suspended.',
      };
    }
    if (
      userData?.role === 'vendor' &&
      userData?.status === 'pending_verification'
    ) {
      return {
        success: false,
        message: 'Your vendor account is pending approval.',
      };
    }

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: 60 * 60 * 24 * 5 * 1000,
    });
    
    cookies().set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    await db
      .collection('users')
      .doc(userRecord.uid)
      .update({
        lastLogin: FieldValue.serverTimestamp(),
      });

    revalidatePath('/', 'layout');

    return { success: true, message: 'Login successful!', role: userData?.role };
  } catch (error: any) {
    console.error('Login error:', error);
    let message = 'Login failed. Please try again.';
    if (
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-credential'
    ) {
      message = 'Incorrect email or password.';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Too many failed attempts. Please try again later.';
    } else if (error.code === 'auth/user-disabled') {
      message = 'This account has been disabled.';
    } else if (error.code === 'auth/id-token-expired') {
      message = 'Session expired. Please log in again.';
    }
    return { success: false, message };
  }
}


export async function forgotPassword(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  if (!email) {
    return { success: false, message: 'Please enter your email address.' };
  }

  try {
    const { auth } = await initAdmin();
    await auth.generatePasswordResetLink(email);
    return { success: true, message: 'Password reset email sent! Check your inbox.' };
  } catch (error: any) {
    console.error('Password reset error:', error);
    // Don't reveal if the user exists or not
    return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' };
  }
}

export async function logout() {
  cookies().delete('session');
  revalidatePath('/', 'layout');
}
