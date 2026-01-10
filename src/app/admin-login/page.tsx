
'use client';

import { useActionState, useEffect } from 'react';
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
import { login, signInWithGoogle } from '@/app/(auth)/actions';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FcGoogle } from 'react-icons/fc';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing In...' : 'Sign In'}
    </Button>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useActionState(login, {
    errors: {},
    success: false,
  });

  useEffect(() => {
    if (state.success && (state.role === 'admin' || state.role === 'super_admin')) {
      toast({
        title: 'Login Successful!',
        description: "Welcome back! You're being redirected to the admin dashboard.",
      });
      router.push('/admin');
    } else if (state.success) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Access Denied: Not an admin account.',
      });
    }
    else if (state.message) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: state.message,
      });
    }
  }, [state, router, toast]);

  const handleGoogleSignIn = async () => {
    const auth = getAuth();
    const db = getFirestore();
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      const userData = userDoc.data();

      if (userDoc.exists() && !['admin', 'super_admin'].includes(userData?.role)) {
        toast({ variant: 'destructive', title: 'Login Failed', description: 'This is not an admin account.' });
        await auth.signOut();
        return;
      }
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          id: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: 'admin',
          createdAt: serverTimestamp(),
        });
      }
      
      const idToken = await user.getIdToken();
      const googleLoginState = await signInWithGoogle(idToken, 'admin');

      if (googleLoginState.success) {
        toast({
          title: 'Login Successful!',
          description: "Welcome back! You're being redirected to the admin dashboard.",
        });
        router.push('/admin');
      } else {
        toast({ variant: 'destructive', title: 'Google Sign-In Failed', description: 'Could not create a session.' });
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
          <CardTitle className="text-2xl">Administrator Login</CardTitle>
          <CardDescription>
            Access the platform's admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
              />
              {state.errors?.email && (
                <p className="text-sm text-destructive">
                  {state.errors.email.join(', ')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
              {state.errors?.password && (
                <p className="text-sm text-destructive">
                  {state.errors.password.join(', ')}
                </p>
              )}
            </div>
            <input type="hidden" name="role" value="admin" />
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
            <Link href="/admin-register" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
