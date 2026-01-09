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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { signup } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Creating Account...' : 'Create Account'}
    </Button>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userType, setUserType] = useState('customer');

  const [state, formAction] = useActionState(signup, {
    message: '',
    errors: {},
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: state.message,
      });
      router.push('/login');
    } else if (state.message) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast, router]);

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <input type="hidden" name="userType" value={userType} />
          <div className="grid gap-2">
            <Label htmlFor="role">Sign up as a</Label>
            <Select
              name="userType"
              required
              onValueChange={setUserType}
              defaultValue="customer"
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="vendor">Seller</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fname">First name</Label>
              <Input id="fname" name="fname" placeholder="Max" required />
              {state.errors?.fname && (
                <p className="text-destructive text-sm">{state.errors.fname}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lname">Last name</Label>
              <Input id="lname" name="lname" placeholder="Robinson" required />
              {state.errors?.lname && (
                <p className="text-destructive text-sm">{state.errors.lname}</p>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="m@example.com"
              required
            />
            {state.errors?.email && (
              <p className="text-destructive text-sm">{state.errors.email}</p>
            )}
          </div>
           <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              name="phone"
              placeholder="+234 800 000 0000"
            />
             {state.errors?.phone && (
              <p className="text-destructive text-sm">{state.errors.phone}</p>
            )}
          </div>

          {userType === 'vendor' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  name="storeName"
                  placeholder="My Awesome Store"
                  required
                />
                 {state.errors?.storeName && (
                  <p className="text-destructive text-sm">{state.errors.storeName}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      name="accountNumber"
                      placeholder="1234567890"
                      maxLength={10}
                      required
                    />
                    {state.errors?.accountNumber && (
                      <p className="text-destructive text-sm">{state.errors.accountNumber}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="nin">NIN</Label>
                    <Input
                      id="nin"
                      name="nin"
                      placeholder="12345678901"
                      maxLength={11}
                      required
                    />
                    {state.errors?.nin && (
                      <p className="text-destructive text-sm">{state.errors.nin}</p>
                    )}
                  </div>
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
            {state.errors?.password && (
              <p className="text-destructive text-sm">
                {state.errors.password}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
            />
            {state.errors?.confirmPassword && (
              <p className="text-destructive text-sm">
                {state.errors.confirmPassword}
              </p>
            )}
          </div>
          <SubmitButton />
          <Button variant="outline" className="w-full" disabled>
            Sign up with Google
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
