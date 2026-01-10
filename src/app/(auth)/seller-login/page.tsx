
'use client';

import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { createSession } from '@/app/(auth)/actions';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FcGoogle } from 'react-icons/fc';
import { app } from '@/firebase/config';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing In...' : 'Sign In'}
    </Button>
  );
}

export default function SellerLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string[], password?: string[], general?: string}>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const auth = getAuth(app);
    const db = getFirestore(app);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists() || userDoc.data().role !== 'seller') {
             setErrors({ general: 'Access Denied: Not a seller account.'});
             toast({ variant: 'destructive', title: 'Login Failed', description: 'Access Denied: Not a seller account.' });
             return;
        }

        const idToken = await user.getIdToken();
        const sessionResult = await createSession(idToken);

        if (sessionResult.success) {
            toast({
                title: 'Login Successful!',
                description: "Welcome back! You're being redirected to your dashboard.",
            });
            router.push('/seller');
        } else {
             setErrors({ general: sessionResult.message });
             toast({ variant: 'destructive', title: 'Login Failed', description: sessionResult.message });
        }
    } catch (error: any) {
        let errorMessage = 'Invalid email or password.';
        if (error.code !== 'auth/user-not-found' && error.code !== 'auth/wrong-password' && error.code !== 'auth/invalid-credential') {
            errorMessage = 'An unexpected error occurred.';
        }
        setErrors({ general: errorMessage });
        toast({ variant: 'destructive', title: 'Login Failed', description: errorMessage });
    }
  };

  const handleGoogleSignIn = async () => {
    const auth = getAuth(app);
    const db = getFirestore(app);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists() && userDoc.data().role !== 'seller') {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'This is not a seller account.' });
        await auth.signOut();
        return;
      }
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          id: user.uid,
          displayName: user.displayName,
          fname: user.displayName?.split(' ')[0] || '',
          lname: user.displayName?.split(' ')[1] || '',
          email: user.email,
          photoURL: user.photoURL,
          role: 'seller',
          createdAt: serverTimestamp(),
        });
      }
      
      const idToken = await user.getIdToken();
      const sessionResult = await createSession(idToken);

      if (sessionResult.success) {
        toast({
          title: 'Login Successful!',
          description: "Welcome back! You're being redirected to your dashboard.",
        });
        router.push('/seller');
      } else {
        toast({ variant: 'destructive', title: 'Google Sign-In Failed', description: sessionResult.message });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Seller Login</CardTitle>
          <CardDescription>
            Access your vendor dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
             {errors.general && (
                <p className="text-sm text-center text-destructive">
                  {errors.general}
                </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <SubmitButton />
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
           <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
            <FcGoogle className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/seller-register" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
