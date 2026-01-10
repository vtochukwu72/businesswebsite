
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
import { signup } from '@/app/(auth)/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Creating Account...' : 'Create Admin Account'}
    </Button>
  );
}

export default function AdminRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useActionState(signup, {
    errors: {},
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Account Created!',
        description:
          "Admin account successfully registered. You are now being redirected to the dashboard.",
      });
      router.push('/admin');
    } else if (state.message) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: state.message,
      });
    }
  }, [state, router, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Admin Account</CardTitle>
          <CardDescription>
            Enter your information to create an administrator account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fname">First Name</Label>
                <Input
                  id="fname"
                  name="fname"
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lname">Last Name</Label>
                <Input
                  id="lname"
                  name="lname"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
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
        </CardContent>
      </Card>
    </div>
  );
}
