
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Twitter,
  Facebook,
  Github,
} from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
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
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Your message"
                  className="min-h-[120px]"
                />
              </div>
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
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
                  <p className="text-muted-foreground">
                    General Inquiries: info@ecommerce.com
                  </p>
                  <p className="text-muted-foreground">
                    Support: support@ecommerce.com
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-muted-foreground">
                    Customer Service: +1 (234) 567-890
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Office</h3>
                  <p className="text-muted-foreground">
                    123 E-Commerce St, Suite 100
                  </p>
                  <p className="text-muted-foreground">Webville, Internet 54321</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex-row items-center gap-4">
              <MessageSquare className="h-10 w-10 text-primary" />
              <div>
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>
                  Chat with a member of our team in real-time.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Live Chat</Button>
              <p className="text-xs text-center mt-2 text-muted-foreground">
                Available Mon-Fri, 9am-5pm
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
              <Link href="#" aria-label="GitHub">
                <Github className="h-6 w-6 text-muted-foreground hover:text-primary" />
              </Link>
            </div>
           </div>
        </div>
      </div>
    </div>
  );
}
