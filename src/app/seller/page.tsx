'use client';
import { use, useState } from 'react';
import { AuthContext } from '@/context/auth-context';
import SellerLoginPage from './login/page';
import SellerDashboardPage from './dashboard';

export default function SellerPage() {
  const authContext = use(AuthContext);

  if (authContext?.loading) {
    // You can return a loading skeleton here if you want
    return null;
  }
  
  if (!authContext?.isAuthenticated || authContext?.userData?.role !== 'seller') {
    return <SellerLoginPage />;
  }

  return <SellerDashboardPage />;
}
