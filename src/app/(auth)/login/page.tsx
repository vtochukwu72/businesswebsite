'use client';

import { useActionState, useEffect, useState } from 'react';
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
import { login, forgotPassword } from '../actions';
import { useToast } from '@/hooks/use-toast';

function LoginSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing In...' : 'Sign In'}
    </Button>
  );
}

function ForgotPasswordSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Sending...' : 'Send Reset Link'}
    </Button>
  );
}


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [loginState, loginAction] = useActionState(login, {
    message: '',
    success: false,
  });
  
  const [forgotPasswordState, forgotPasswordAction] = useActionState(forgotPassword, {
    message: '',
    success: false,
  });

  useEffect(() => {
    if(loginState.success) {
      toast({ title: 'Success', description: loginState.message });
      let redirectPath = '/';
      switch(loginState.role) {
        case 'admin':
          redirectPath = '/admin';
          break;
        case 'seller':
          redirectPath = '/seller';
          break;
        case 'customer':
          redirectPath = '/account';
          break;
      }
      router.push(redirectPath);
    } else if (loginState.message) {
      toast({ variant: 'destructive', title: 'Error', description: loginState.message });
    }
  }, [loginState, router, toast]);

  useEffect(() => {
    if(forgotPasswordState.message) {
        if(forgotPasswordState.success) {
            toast({ title: 'Check your email', description: forgotPasswordState.message });
            setShowForgotPassword(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: forgotPasswordState.message });
        }
    }
  }, [forgotPasswordState, toast]);


  return (
    <Card className="mx-auto max-w-sm">
      {!showForgotPassword ? (
        <>
          <CardHeader>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={loginAction} className="space-y-4">
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
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </button>
                </div>
                <Input id="password" name="password" type="password" required />
              </div>
              <LoginSubmitButton />
              <Button variant="outline" className="w-full" disabled>
                Login with Google
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="underline">
                Sign up
              </Link>
            </div>
             <div className="mt-2 text-center text-sm">
              Want to sell on our platform?{' '}
              <Link href="/seller-register" className="underline font-semibold">
                Register as a Seller
              </Link>
            </div>
          </CardContent>
        </>
      ) : (
         <>
          <CardHeader>
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={forgotPasswordAction} className="space-y-4">
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
              <ForgotPasswordSubmitButton />
            </form>
            <div className="mt-4 text-center text-sm">
              <button onClick={() => setShowForgotPassword(false)} className="underline">
                Back to Login
              </button>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}
