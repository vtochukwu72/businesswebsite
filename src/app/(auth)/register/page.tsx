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
import { getAuth, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/firebase/config';
import { Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { Separator } from '@/components/ui/separator';

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
    const fullName = `${fname} ${lname}`.trim();

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: fullName });

        await setDoc(doc(db, 'users', user.uid), {
            id: user.uid,
            email: user.email,
            fname,
            lname,
            fullName: fullName,
            phone: "",
            shippingAddress: {},
            photoURL: user.photoURL,
            role: 'customer',
            emailVerified: user.emailVerified,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            cart: [],
            wishlist: [],
            preferences: {
                newsletter: false,
                marketingEmails: false
            }
        });
        
        toast({
            title: 'Account Created!',
            description: 'Please sign in to continue.',
        });
        router.push('/login');

    } catch (error: any) {
        let errorMessage = 'An unexpected error occurred.';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email address is already in use.';
        }
        setErrors({ general: errorMessage });
        toast({ variant: 'destructive', title: 'Registration Failed', description: errorMessage });
    }
  };

  const handleGoogleSignUp = async () => {
    const auth = getAuth(app);
    const db = getFirestore(app);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      // If user already exists, handle redirection or login
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'customer') {
            // This is just a login attempt for an existing customer
            toast({ title: 'Welcome Back!', description: 'You already have an account. Logging you in.' });
        } else {
            // User exists but has a different role
            const role = userData.role || 'user';
            let loginPath = '/login'; // default
            if (role === 'seller') loginPath = '/seller-login';
            if (['admin', 'super_admin'].includes(role)) loginPath = '/admin-login';

            toast({
                variant: 'destructive',
                title: 'Account Exists',
                description: `An account with this email already exists as a ${role}. Please use the correct login page.`,
            });
            await auth.signOut();
            router.push(loginPath);
            return;
        }
      } else {
        // User does not exist, create a new customer account
        const fullName = user.displayName || '';
        const nameParts = fullName.split(' ');
        const fname = nameParts[0] || '';
        const lname = nameParts.slice(1).join(' ') || '';

        await setDoc(userRef, {
          id: user.uid,
          fullName: fullName,
          fname: fname,
          lname: lname,
          email: user.email,
          photoURL: user.photoURL,
          role: 'customer',
          emailVerified: user.emailVerified,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          cart: [],
          wishlist: [],
          shippingAddress: {},
          preferences: {
            newsletter: false,
            marketingEmails: false
          }
        });

        toast({
          title: 'Account Created!',
          description: 'Welcome! You are now logged in.',
        });
      }
      
      // Proceed to create session and log the user in
      const idToken = await user.getIdToken();
      const sessionResult = await createSession(idToken);

      if (sessionResult.success) {
        router.push('/');
      } else {
        toast({ variant: 'destructive', title: 'Sign-Up Failed', description: sessionResult.message });
        await auth.signOut();
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Google Sign-Up Failed',
        description: error.message || 'An unexpected error occurred.',
      });
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

          <div className="relative my-4">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              OR
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignUp}
          >
            <FcGoogle className="mr-2 h-5 w-5" />
            Sign up with Google
          </Button>

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
