'use client';

import { useEffect, useState, use } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/app/(auth)/actions';
import { useToast } from '@/hooks/use-toast';
import { auth as clientAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { AuthContext } from '@/context/auth-context';
import { doc, getDoc } from 'firebase/firestore';

function LoginSubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || isSubmitting;

  return (
    <Button type="submit" className="w-full" disabled={isDisabled}>
      {isDisabled ? 'Signing In...' : 'Sign In'}
    </Button>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleClientLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not available.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore before creating session
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists() && (userDoc.data().role === 'admin' || userDoc.data().role === 'super_admin')) {
        const idToken = await user.getIdToken();
        const serverFormData = new FormData();
        serverFormData.append('idToken', idToken);
        
        const result = await login(null, serverFormData);

        if (result.success) {
          toast({ title: 'Success', description: 'Admin login successful!' });
          router.push('/admin'); // Redirect to admin dashboard
          router.refresh(); // Refresh to update layouts
        } else {
          toast({ variant: 'destructive', title: 'Server Error', description: result.message });
          setIsSubmitting(false);
        }
      } else {
        toast({ variant: 'destructive', title: 'Access Denied', description: 'This login is for administrators only.' });
        setIsSubmitting(false);
      }
    } catch (error: any) {
        let message = 'Login failed. Please try again.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code ==='auth/invalid-credential') {
            message = 'Incorrect email or password.';
        } else if (error.code === 'auth/too-many-requests') {
            message = 'Too many failed attempts. Please try again later.';
        }
        toast({ variant: 'destructive', title: 'Error', description: message });
        setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Admin Sign In</CardTitle>
        <CardDescription>
          Enter your email below to login to the admin dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleClientLogin} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <LoginSubmitButton isSubmitting={isSubmitting} />
        </form>
        <div className="mt-4 text-center text-sm">
          Need an admin account?{' '}
          <Link href="/admin-register" className="underline">
            Register here
          </Link>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
