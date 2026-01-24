import type { Metadata } from 'next';
import './globals.css';
import '../styles/auth.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'DealZa',
  description: 'DealZa - A full-featured e-commerce platform',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <Script src="https://js.paystack.co/v1/inline.js" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <FirebaseErrorListener />
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
