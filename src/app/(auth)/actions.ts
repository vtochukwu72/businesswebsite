
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// This is a server-only file.
// Firebase client SDK functions should not be used here.

export async function createSession(idToken: string) {
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
