'use client';
import { File } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import type { User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function UserRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
    </TableRow>
  );
}

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedUsers: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedUsers.push({
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to a format that can be serialized
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        } as User);
      });
      setUsers(fetchedUsers);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching real-time users: ", error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const filteredUsers = useMemo(() => {
    if (filter === 'all') return users;
    return users.filter(user => user.role === filter);
  }, [users, filter]);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return 'default';
      case 'seller':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  const handleExport = () => {
    const dataToExport = filteredUsers.map(user => ({
      'Name': user.displayName || `${user.fname} ${user.lname}` || 'N/A',
      'Email': user.email,
      'Role': user.role.replace('_', ' '),
      'Joined Date': new Date(user.createdAt).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, `users-export-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Tabs defaultValue="all" onValueChange={setFilter}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="customer">Customers</TabsTrigger>
            <TabsTrigger value="seller">Sellers</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1"
              onClick={handleExport}
              disabled={loading || filteredUsers.length === 0}
            >
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export to Excel
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value={filter}>
          <Card>
            <CardHeader>
              <CardTitle>Customers</CardTitle>
              <CardDescription>
                Manage your customers and view their information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Joined Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <>
                      <UserRowSkeleton />
                      <UserRowSkeleton />
                      <UserRowSkeleton />
                      <UserRowSkeleton />
                    </>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.displayName || `${user.fname} ${user.lname}` || 'N/A'}
                        </TableCell>
                         <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">{user.role.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.email}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing <strong>1-{filteredUsers.length}</strong> of <strong>{filteredUsers.length}</strong> users
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
