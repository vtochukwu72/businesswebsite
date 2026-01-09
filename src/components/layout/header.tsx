'use client';

import Link from 'next/link';
import {
  CircleUser,
  Heart,
  Menu,
  Search,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Icons } from '@/components/icons';
import { useEffect, useState } from 'react';
import {
  useUser,
  useDoc,
  useFirestore,
  useMemoFirebase,
  type WithId,
} from '@/firebase';
import type { Cart, Wishlist } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: '/products', label: 'Shop' },
  { href: '#deals', label: 'Deals' },
  { href: '#categories', label: 'Categories' },
  { href: '#contact', label: 'Contact' },
];

export function Header() {
  const [isClient, setIsClient] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const cartRef = useMemoFirebase(
    () =>
      firestore && user
        ? doc(firestore, 'users', user.uid, 'carts', 'default')
        : null,
    [firestore, user]
  );
  const { data: cart } = useDoc<Cart>(cartRef);

  const wishlistRef = useMemoFirebase(
    () =>
      firestore && user
        ? doc(firestore, 'users', user.uid, 'wishlists', 'default')
        : null,
    [firestore, user]
  );
  const { data: wishlist } = useDoc<Wishlist>(wishlistRef);

  const cartItemCount = cart?.items?.length || 0;
  const wishlistItemCount = wishlist?.items?.length || 0;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get('search') as string;
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };


  if (!isClient) {
    return null;
  }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="flex items-center gap-2">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="font-bold">E-Commerce</span>
          </Link>
        </div>

        <div className="flex items-center md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="mr-4">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Icons.logo className="h-6 w-6 text-primary" />
                  <span className="sr-only">E-Commerce</span>
                </Link>
                {navLinks.map((link) => (
                  <Link
                    href={link.href}
                    key={link.href + link.label}
                    className="hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              href={link.href}
              key={link.href + link.label}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex flex-1 items-center justify-end gap-4">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  name="search"
                  placeholder="Search products..."
                  className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[300px]"
                />
              </div>
            </form>
          </div>
           <Link href="/account/wishlist">
            <Button variant="ghost" size="icon" className="relative">
              <Heart className="h-5 w-5" />
              {wishlistItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {wishlistItemCount}
                </span>
              )}
              <span className="sr-only">Wishlist</span>
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                 <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/account">
                <DropdownMenuItem>Profile</DropdownMenuItem>
              </Link>
              <Link href="/account/orders">
                <DropdownMenuItem>Orders</DropdownMenuItem>
              </Link>
              <Link href="/seller">
                <DropdownMenuItem>Seller Dashboard</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link href="/login">
                <DropdownMenuItem>Login</DropdownMenuItem>
              </Link>
              <Link href="/register">
                <DropdownMenuItem>Register</DropdownMenuItem>
              </Link>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
