'use client';

import { useState } from 'react';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  type WithId,
} from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminCustomersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');

  const customersQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'users'), where('role', '==', 'customer'))
        : null,
    [firestore]
  );
  const { data: customers, isLoading: isLoadingCustomers } =
    useCollection<User>(customersQuery);

  const vendorsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'users'), where('role', '==', 'seller'))
        : null,
    [firestore]
  );
  const { data: vendors, isLoading: isLoadingVendors } =
    useCollection<User>(vendorsQuery);

  const updateUserStatus = async (userId: string, status: string) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', userId);
    try {
      await updateDoc(userRef, { status });
      toast({
        title: 'User Status Updated',
        description: `User has been marked as ${status}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update user status.',
      });
    }
  };
  
  const verifyVendor = async (vendorId: string) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', vendorId);
    const vendorRef = doc(firestore, 'vendors', vendorId);
    try {
      await updateDoc(userRef, { status: 'active' });
      await updateDoc(vendorRef, { status: 'approved' });
      toast({
        title: 'Vendor Approved',
        description: 'The vendor account has been verified and activated.',
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not verify vendor.',
      });
    }
  }

  const isLoading = isLoadingCustomers || isLoadingVendors;

  const renderUserTable = (users: WithId<User>[], userType: 'customer' | 'vendor') => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={5}>
                <Skeleton className="h-8 w-full" />
              </TableCell>
            </TableRow>
          ))}
        {users?.map((user: WithId<User>) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">
              {user.fname} {user.lname}
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge
                variant={
                  user.status === 'active' || user.status === 'approved' ? 'default' : 'secondary'
                }
                className="capitalize"
              >
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>
              {user.lastLogin
                ? new Date(
                    (user.lastLogin as any).seconds * 1000
                  ).toLocaleDateString()
                : 'N/A'}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  {userType === 'vendor' && user.status === 'pending_verification' && (
                     <DropdownMenuItem onClick={() => verifyVendor(user.id)}>
                        Approve Vendor
                      </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => updateUserStatus(user.id, 'active')}
                  >
                    Activate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateUserStatus(user.id, 'suspended')}
                  >
                    Suspend
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          View and manage all users on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
          </TabsList>
          <TabsContent value="customers">
            {renderUserTable(customers || [], 'customer')}
            {!isLoading && customers?.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                    <h3 className="text-lg font-semibold">No customers found.</h3>
                </div>
            )}
          </TabsContent>
          <TabsContent value="vendors">
             {renderUserTable(vendors || [], 'vendor')}
             {!isLoading && vendors?.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                    <h3 className="text-lg font-semibold">No vendors found.</h3>
                </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
