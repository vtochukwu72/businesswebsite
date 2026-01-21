'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Mail,
  MapPin,
  MessageSquare,
  Twitter,
  Facebook,
} from 'lucide-react';
import Link from 'next/link';
import { ContactForm } from '@/components/contact/contact-form';

export default function ContactPage() {
  const officeAddress =
    'Faculty of management sciences department of business administration';
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    officeAddress
  )}`;

  return (
    <div className="container py-12 md:py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Get in Touch
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
          We&apos;d love to hear from you. Whether you have a question about
          features, trials, pricing, or anything else, our team is ready to
          answer all your questions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send us a Message</CardTitle>
            <CardDescription>
              Fill out the form below and we&apos;ll get back to you as soon as
              possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>

        {/* Contact Info & Live Chat */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Reach out to us through any of the following channels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <a
                    href="mailto:vtochukwu72@gmail.com"
                    className="text-muted-foreground hover:underline"
                  >
                    General Inquiries: vtochukwu72@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Office</h3>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:underline"
                  >
                    <p>
                      Faculty of management sciences department of business
                      administration
                    </p>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex-row items-center gap-4">
              <MessageSquare className="h-10 w-10 text-primary" />
              <div>
                <CardTitle>Quick Help</CardTitle>
                <CardDescription>
                  Have a question? Fill out our contact form.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <a
                href="#contact-form"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full"
              >
                Send a Message
              </a>
              <p className="text-xs text-center mt-2 text-muted-foreground">
                We typically respond within 24 hours.
              </p>
            </CardContent>
          </Card>

          <div className="text-center">
            <h3 className="font-semibold mb-4">Follow us on Social Media</h3>
            <div className="flex items-center justify-center gap-4">
              <Link href="#" aria-label="Twitter">
                <Twitter className="h-6 w-6 text-muted-foreground hover:text-primary" />
              </Link>
              <Link href="#" aria-label="Facebook">
                <Facebook className="h-6 w-6 text-muted-foreground hover:text-primary" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
