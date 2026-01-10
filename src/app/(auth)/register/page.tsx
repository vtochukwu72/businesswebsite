
'use client';

import { useState } from 'react';
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
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/firebase/config';
import { Eye, EyeOff } from 'lucide-react';

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
  const [formData, setFormData] = useState({
      fname: '',
      lname: '',
      email: '',
      password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{fname?: string[], lname?: string[], email?: string[], password?: string[], general?: string}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const auth = getAuth(app);
    const db = getFirestore(app);

    const { email, password, fname, lname } = formData;
    const displayName = `${fname} ${lname}`;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName });

        await setDoc(doc(db, 'users', user.uid), {
            id: user.uid,
            email: user.email,
            fname,
            lname,
            displayName,
            phone: "",
            address: {},
            photoURL: user.photoURL,
            role: 'customer',
            emailVerified: user.emailVerified,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            cart: [],
            wishlist: [],
            orders: [],
            shippingAddresses: [],
            preferences: {
                newsletter: false,
                marketingEmails: false
            }
        });
        
        const idToken = await user.getIdToken();
        const sessionResult = await createSession(idToken);

        if (sessionResult.success) {
            toast({
                title: 'Account Created!',
                description: 'Welcome! You have been successfully registered.',
            });
            router.push('/');
        } else {
            setErrors({ general: sessionResult.message });
            toast({ variant: 'destructive', title: 'Registration Failed', description: sessionResult.message });
        }

    } catch (error: any) {
        let errorMessage = 'An unexpected error occurred.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email address is already in use.';
        }
        setErrors({ general: errorMessage });
        toast({ variant: 'destructive', title: 'Registration Failed', description: errorMessage });
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Join our platform to start shopping.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
             {errors.general && (
                <p className="text-sm text-center text-destructive">
                  {errors.general}
                </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fname">First Name</Label>
                <Input
                  id="fname"
                  name="fname"
                  placeholder="John"
                  required
                  value={formData.fname}
                  onChange={handleInputChange}
                />
                 {errors?.fname && (
                    <p className="text-sm text-destructive">{errors.fname.join(', ')}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lname">Last Name</Label>
                <Input
                  id="lname"
                  name="lname"
                  placeholder="Doe"
                  required
                  value={formData.lname}
                  onChange={handleInputChange}
                />
                 {errors?.lname && (
                    <p className="text-sm text-destructive">{errors.lname.join(', ')}</p>
                )}
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
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors?.email && (
                <p className="text-sm text-destructive">
                  {errors.email.join(', ')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'}
                  required 
                  value={formData.password}
                  onChange={handleInputChange}
                />
                 <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors?.password && (
                <p className="text-sm text-destructive">
                  {errors.password.join(', ')}
                </p>
              )}
            </div>
            <SubmitButton />
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
