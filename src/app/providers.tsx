
'use client';

import { AuthProvider } from '@/context/auth-context';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </FirebaseClientProvider>
  );
}
