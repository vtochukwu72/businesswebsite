
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';

export default function AccountPage() {
  const { user, userData } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {userData?.displayName || user?.email}!</CardTitle>
          <CardDescription>
            This is your account dashboard. You can manage your profile, orders,
            and settings here.
          </-cardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> <span className="capitalize">{userData?.role}</span></p>
            <p><strong>Member since:</strong> {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
