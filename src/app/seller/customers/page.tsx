'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { getCustomersForSeller } from '@/services/user-service';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/types';

function CustomerRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-4 w-24" />
      </TableCell>
    </TableRow>
  );
}

export default function SellerCustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      if (user?.uid) {
        setLoading(true);
        const sellerCustomers = await getCustomersForSeller(user.uid);
        setCustomers(sellerCustomers);
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, [user]);

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Customers</CardTitle>
          <CardDescription>
            A list of customers who have purchased products from you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">
                  Joined Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  <CustomerRowSkeleton />
                  <CustomerRowSkeleton />
                  <CustomerRowSkeleton />
                </>
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={customer.photoURL}
                            alt={customer.displayName}
                          />
                          <AvatarFallback>
                            {(
                              customer.displayName || customer.email
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {customer.displayName || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
