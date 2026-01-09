import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Github, Twitter, Facebook } from 'lucide-react';
import { NewsletterForm } from '../newsletter-form';

export function Footer() {
  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="container">
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Icons.logo className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">E-Commerce</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your one-stop shop for everything you need.
            </p>
          </div>

          <div>
            <h4 className="font-semibold">Shop</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/products" className="text-muted-foreground hover:text-foreground">All Products</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">New Arrivals</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Best Sellers</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground">Deals</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold">Support</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact Us</Link></li>
              <li><Link href="/shipping-and-returns" className="text-muted-foreground hover:text-foreground">Shipping</Link></li>
              <li><Link href="/shipping-and-returns" className="text-muted-foreground hover:text-foreground">Returns</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold">Company</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold">Stay Connected</h4>
            <p className="mt-4 text-sm text-muted-foreground">Subscribe to our newsletter for the latest updates and deals.</p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t py-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} E-Commerce Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" aria-label="Twitter"><Twitter className="h-5 w-5 text-muted-foreground hover:text-foreground" /></Link>
            <Link href="#" aria-label="Facebook"><Facebook className="h-5 w-5 text-muted-foreground hover:text-foreground" /></Link>
            <Link href="#" aria-label="GitHub"><Github className="h-5 w-5 text-muted-foreground hover:text-foreground" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

    