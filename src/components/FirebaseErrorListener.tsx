'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';

/**
 * A client-side component that listens for Firestore permission errors
 * and throws them. This allows the errors to be caught by Next.js's
 * development error overlay, providing a rich debugging experience.
 * This component renders nothing and is only active in development.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const handleError = (error: FirestorePermissionError) => {
      // Throwing the error will cause it to be picked up by Next.js's
      // error overlay in development mode.
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.removeListener('permission-error', handleError);
    };
  }, []);

  return null;
}
