'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem('cookie_consent');
    if (consent === null) {
      setShowConsent(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'granted');
    setShowConsent(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'denied');
    setShowConsent(false);
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto shadow-2xl">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
          <p className="text-sm text-muted-foreground">
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept&quot;, you consent to our use of cookies.
          </p>
          <div className="flex-shrink-0 flex gap-2">
            <Button onClick={handleAccept}>Accept</Button>
            <Button variant="outline" onClick={handleReject}>
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
