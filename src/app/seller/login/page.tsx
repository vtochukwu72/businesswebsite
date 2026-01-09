
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
import { login } from '@/app/(auth)/actions';
import { useToast } from '@/hooks/use-toast';
import { auth as clientAuth } from '@/firebase/client';
import { signInWithEmailAndPassword } from 'firebase/auth';

function LoginSubmitButton() {
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

  const [loginState, loginAction] = useActionState(login, {
    message: '',
    success: false,
    role: '',
  });

  const handleClientLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
      const idToken = await userCredential.user.getIdToken();

      const serverFormData = new FormData();
      serverFormData.append('idToken', idToken);
      loginAction(serverFormData);

    } catch (error: any) {
        let message = 'Login failed. Please try again.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code ==='auth/invalid-credential') {
            message = 'Incorrect email or password.';
        } else if (error.code === 'auth/too-many-requests') {
            message = 'Too many failed attempts. Please try again later.';
        } else if (error.code === 'auth/user-disabled') {
            message = 'This account has been disabled.';
        }
        toast({ variant: 'destructive', title: 'Error', description: message });
    }
  }

  useEffect(() => {
    if(loginState.success) {
      if (loginState.role === 'seller') {
        toast({ title: 'Success', description: loginState.message });
        router.push('/seller');
        router.refresh();
      } else {
        // If a non-seller tries to log in here, show an error.
         toast({ variant: 'destructive', title: 'Access Denied', description: 'This login is for sellers only.' });
      }
    } else if (loginState.message && !loginState.success) {
      toast({ variant: 'destructive', title: 'Error', description: loginState.message });
    }
  }, [loginState, router, toast]);

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Seller Sign In</CardTitle>
        <CardDescription>
          Enter your email below to login to your seller dashboard.
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
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="ml-auto inline-block text-sm underline"
              >
                Forgot your password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>
          <LoginSubmitButton />
        </form>
        <div className="mt-4 text-center text-sm">
          Want to become a seller?{' '}
          <Link href="/seller-register" className="underline">
            Register here
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
