'use client';
import { File, MoreHorizontal } from 'lucide-react';
import { useEffect, useState, useMemo, useTransition } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { useToast } from '@/hooks/use-toast';
import { deleteUser } from './actions';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

function UserRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
    </TableRow>
  );
}

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

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
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        } as User);
      });
      setUsers(fetchedUsers);
      setLoading(false);
    }, (error) => {
      const permissionError = new FirestorePermissionError({
        path: 'users',
        operation: 'list',
      }, error);
      errorEmitter.emit('permission-error', permissionError);

      console.error("Error fetching real-time users: ", error);
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "You do not have permission to view the list of users."
      });
      setUsers([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const filteredUsers = useMemo(() => {
    if (filter === 'all') return users;
    return users.filter(user => user.role === filter);
  }, [users, filter]);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return 'destructive';
      case 'seller':
        return 'secondary';
      default:
        return 'default';
    }
  }

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedUser) return;
    startTransition(async () => {
        const result = await deleteUser(selectedUser.id);
        if (result.success) {
            toast({
                title: 'User Deleted',
                description: result.message,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: result.message,
            });
        }
        setDialogOpen(false);
        setSelectedUser(null);
    });
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
    <>
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
              <CardTitle>Platform Users</CardTitle>
              <CardDescription>
                Manage all users and view their information.
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
                     <TableHead>
                        <span className="sr-only">Actions</span>
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
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onSelect={() => handleDeleteClick(user)}>
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
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
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account
                and all associated data from our servers.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isPending}>
                {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
