'use client';
import { Mail, Trash2, MoreVertical, Archive, User as UserIcon } from 'lucide-react';
import { useEffect, useState, useTransition, useMemo } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ContactMessage, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { toggleMessageReadStatus, deleteMessage } from './actions';
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

function MessageRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-40 mt-1" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-64 mt-1" />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-8 ml-auto" />
      </TableCell>
    </TableRow>
  );
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    let messagesLoaded = false;
    let usersLoaded = false;

    const checkAllLoaded = () => {
        if(messagesLoaded && usersLoaded) {
            setLoading(false);
        }
    }

    const messagesUnsub = onSnapshot(query(collection(db, 'contacts'), orderBy('createdAt', 'desc')), (snapshot) => {
      const fetchedMessages: ContactMessage[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          } as ContactMessage;
      });
      setMessages(fetchedMessages);
      messagesLoaded = true;
      checkAllLoaded();
    }, (error) => {
        console.error("Error fetching messages:", error);
        toast({
            variant: "destructive",
            title: "Permission Denied",
            description: "Could not load messages."
        });
        messagesLoaded = true;
        checkAllLoaded();
    });
    
    const usersUnsub = onSnapshot(query(collection(db, 'users')), (snapshot) => {
        const userList: User[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(userList);
        usersLoaded = true;
        checkAllLoaded();
    }, (error) => {
        console.error("Error fetching users:", error);
        toast({
            variant: "destructive",
            title: "Permission Denied",
            description: "Could not load user data for messages."
        });
        usersLoaded = true;
        checkAllLoaded();
    });

    return () => {
        messagesUnsub();
        usersUnsub();
    };
  }, [toast]);

  const enrichedMessages = useMemo(() => {
    const userEmailMap = new Map(users.map(u => [u.email, u]));
    return messages.map(msg => ({
      ...msg,
      sender: userEmailMap.get(msg.email) || null
    }));
  }, [messages, users]);


  const handleToggleRead = (message: ContactMessage) => {
    startTransition(async () => {
      const result = await toggleMessageReadStatus(message.id, message.isRead);
      if (result.success) {
        toast({ title: result.message });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
    });
  };

  const handleDeleteClick = (message: ContactMessage) => {
    setSelectedMessage(message);
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedMessage) return;
    startTransition(async () => {
      const result = await deleteMessage(selectedMessage.id);
       if (result.success) {
        toast({ title: result.message });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
      }
      setDialogOpen(false);
      setSelectedMessage(null);
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return 'destructive';
      case 'seller':
        return 'secondary';
      case 'customer':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <>
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>
            Live messages from users, vendors, and guests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sender</TableHead>
                <TableHead>Subject & Message</TableHead>
                <TableHead className="hidden md:table-cell">Received</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  <MessageRowSkeleton />
                  <MessageRowSkeleton />
                  <MessageRowSkeleton />
                </>
              ) : enrichedMessages.length > 0 ? (
                enrichedMessages.map((message) => {
                  const senderRole = message.sender ? message.sender.role.replace('_', ' ') : 'Guest';
                  const senderName = message.sender?.displayName || message.name;

                  return (
                    <TableRow key={message.id} className={!message.isRead ? 'bg-muted/50' : ''}>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <p className={`font-medium ${!message.isRead ? 'font-bold' : ''}`}>{senderName}</p>
                                <Badge variant={getRoleBadgeVariant(senderRole)} className="capitalize">{senderRole}</Badge>
                            </div>
                            <a href={`mailto:${message.email}`} className="text-sm text-muted-foreground hover:underline">
                                {message.email}
                            </a>
                        </TableCell>
                        <TableCell>
                        <p className={`font-medium ${!message.isRead ? 'font-bold' : ''}`}>{message.subject}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">{message.message}</p>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onSelect={() => handleToggleRead(message)}>
                                        {!message.isRead ? <Mail className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
                                        Mark as {message.isRead ? 'Unread' : 'Read'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleDeleteClick(message)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No messages yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>

    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this message.
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
