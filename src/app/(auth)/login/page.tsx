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
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FcGoogle } from 'react-icons/fc';
import { app } from '@/firebase/config';
import { Eye, EyeOff } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing In...' : 'Sign In'}
    </Button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

        if (!userDoc.exists() || userDoc.data().role !== 'customer') {
             setErrors({ general: 'Access Denied: Not a customer account.'});
             toast({ variant: 'destructive', title: 'Login Failed', description: 'Access Denied: Not a customer account.' });
             return;
        }

        const idToken = await user.getIdToken();
        const sessionResult = await createSession(idToken);
        if (sessionResult.success) {
            toast({
                title: 'Login Successful!',
                description: 'Welcome back! Redirecting you to the homepage.',
            });
            router.push('/');
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

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      // User does not have a record in our database
      if (!userDoc.exists()) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'No account found with this email. Please register first.',
        });
        await auth.signOut();
        router.push('/register');
        return;
      }
      
      const userData = userDoc.data();

      // Check for correct role
      if (userData.role !== 'customer') {
          const role = userData.role || 'user';
          let loginPath = '/login'; // default
          if (role === 'seller') loginPath = '/seller-login';
          if (['admin', 'super_admin'].includes(role)) loginPath = '/admin-login';
          
          toast({
            variant: 'destructive',
            title: 'Incorrect Role',
            description: `This is a ${role} account. Please use the correct login page.`,
          });
          await auth.signOut();
          router.push(loginPath);
          return;
      }
      
      const idToken = await user.getIdToken();
      const sessionResult = await createSession(idToken);

      if (sessionResult.success) {
        toast({
          title: 'Login Successful!',
          description: 'Welcome back! Redirecting you to the homepage.',
        });
        router.push('/');
      } else {
        toast({ variant: 'destructive', title: 'Google Sign-In Failed', description: sessionResult.message });
        await auth.signOut();
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
          <CardTitle className="text-2xl">Customer Login</CardTitle>
          <CardDescription>
            Welcome back! Please sign in to your account.
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
