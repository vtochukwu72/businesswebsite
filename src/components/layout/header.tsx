'use client';

import Link from 'next/link';
import { Menu, Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Icons } from '@/components/icons';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import React from 'react';
import { products as staticProducts } from '@/lib/static-data';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const otherLinks = [{ href: '/contact', label: 'Contact' }];

export function Header() {
  const router = useRouter();
  const { user, userData, loading, logout } = useAuth();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'An error occurred while logging out.',
      });
    }
  };

  const categories = useMemo(() => {
    if (!staticProducts) return [];
    return [...new Set(staticProducts.map((p) => p.category))];
  }, []);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get('search') as string;
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-8 lg:px-12">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="flex items-center gap-2">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="font-bold">E-Commerce</span>
          </Link>
        </div>

        <div className="flex items-center md:hidden">
          {isClient ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="mr-4">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <SheetHeader>
                  <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                </SheetHeader>
                <div className="flex h-full flex-col">
                  <nav className="grid gap-6 text-lg font-medium">
                    <Link
                      href="/"
                      className="flex items-center gap-2 text-lg font-semibold"
                    >
                      <Icons.logo className="h-6 w-6 text-primary" />
                      <span>E-Commerce</span>
                    </Link>
                    <Link href="/products" className="hover:text-foreground">
                      Shop
                    </Link>
                    {categories.map((category) => (
                      <Link
                        href="/products"
                        key={category}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {category}
                      </Link>
                    ))}
                    {otherLinks.map((link) => (
                      <Link
                        href={link.href}
                        key={link.href + link.label}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-auto">
                    {!loading && !user && (
                      <>
                        <Separator className="my-4" />
                        <div className="grid gap-2">
                          <Button asChild>
                            <Link href="/login">Sign In</Link>
                          </Button>
                          <Button asChild variant="outline">
                            <Link href="/register">Register</Link>
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button variant="outline" size="icon" className="mr-4" disabled>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          )}

          <Link href="/" className="flex items-center gap-2 md:hidden">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="font-bold sr-only sm:not-sr-only">E-Commerce</span>
          </Link>
        </div>

        <div className="hidden items-center gap-4 text-sm font-medium md:flex">
          {isClient ? (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Shop</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                      <ListItem href="/products" title="All Products">
                        Browse our full collection of amazing products.
                      </ListItem>
                      <ListItem href="/products" title="Deals">
                        Check out our latest deals and special offers.
                      </ListItem>
                      {categories.map((category) => (
                        <ListItem
                          key={category}
                          href="/products"
                          title={category}
                        >
                          Shop all items in the {category} category.
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                {otherLinks.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink
                      asChild
                      className={navigationMenuTriggerStyle()}
                    >
                      <Link href={link.href}>{link.label}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          ) : (
            <div className="flex items-center gap-1">
              <div className={cn(navigationMenuTriggerStyle(), 'cursor-wait opacity-60')}>Shop</div>
              {otherLinks.map(link => (
                <div key={link.href} className={cn(navigationMenuTriggerStyle(), 'cursor-wait opacity-60')}>{link.label}</div>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex flex-1 items-center justify-end gap-2">
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
          <Link href="/cart" aria-label="Open shopping cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
          
          {isClient ? (
            loading ? (
              <div className="hidden sm:flex">
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.photoURL || userData?.photoURL || ''} alt={user.displayName || 'User'} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {(userData?.fname?.[0] || user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/account">Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/account/orders">Orders</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )
          ) : (
            <div className="hidden sm:flex">
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
          )}
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
