'use client';

import { useActionState, useEffect, useState, use } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth, AuthContext } from '@/context/auth-context';
import { updateProfile } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save Changes'}</Button>;
}

export default function AccountProfilePage() {
  const authContext = use(AuthContext);

  if (!authContext) {
    // This can happen briefly on first load or if outside provider
    return <p>Loading user...</p>;
  }

  const { user, userData, loading: authLoading } = authContext;

  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        fname: userData.fname || '',
        lname: userData.lname || '',
        phone: userData.phoneNumber || '',
        email: userData.email || '',
      });
    }
  }, [userData]);
  
  const updateProfileWithUserId = updateProfile.bind(null, user?.uid || '');
  const [state, formAction] = useActionState(updateProfileWithUserId, { success: false, message: '' });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({ title: 'Success', description: state.message });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: state.message });
      }
    }
  }, [state, toast]);

  const isLoading = authLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal details.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-24 self-end" />
          </div>
        ) : userData ? (
          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fname">First Name</Label>
                <Input
                  id="fname"
                  name="fname"
                  value={formData.fname}
                  onChange={(e) => setFormData({...formData, fname: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lname">Last Name</Label>
                <Input
                  id="lname"
                  name="lname"
                  value={formData.lname}
                  onChange={(e) => setFormData({...formData, lname: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="disabled-input"
              />
               <p className="text-sm text-muted-foreground">Email cannot be changed.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+234 800 000 0000"
              />
            </div>
            <div className="flex justify-end">
              <SubmitButton />
            </div>
          </form>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <h3 className="text-lg font-semibold">Profile not found.</h3>
            <p>Please log in to view your profile.</p>
             <Button asChild className="mt-4">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
