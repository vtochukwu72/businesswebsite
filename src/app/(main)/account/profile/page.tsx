
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
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
import { useAuth } from '@/context/auth-context';
import { updateUserProfile } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

export default function ProfilePage() {
  const { user, userData, loading } = useAuth();
  const { toast } = useToast();

  const [state, formAction] = useActionState(updateUserProfile, {
    success: false,
    errors: {},
  });

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
      });
    } else if (state.message) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: state.message,
      });
    }
  }, [state, toast]);

  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
      return <div>Please log in to view your profile.</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your personal information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="userId" value={user.uid} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="fname">First Name</Label>
                <Input
                id="fname"
                name="fname"
                defaultValue={userData?.fname || ''}
                />
                {state.errors?.fname && (
                    <p className="text-sm text-destructive">{state.errors.fname.join(', ')}</p>
                )}
            </div>
             <div className="space-y-2">
                <Label htmlFor="lname">Last Name</Label>
                <Input
                id="lname"
                name="lname"
                defaultValue={userData?.lname || ''}
                />
                {state.errors?.lname && (
                    <p className="text-sm text-destructive">{state.errors.lname.join(', ')}</p>
                )}
            </div>
          </div>
           <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email || ''}
                disabled
                />
            </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={userData?.phone || ''}
            />
             {state.errors?.phone && (
                <p className="text-sm text-destructive">{state.errors.phone.join(', ')}</p>
            )}
          </div>
          
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
