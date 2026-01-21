'use client';
import {
  Mail,
  Trash2,
  MoreVertical,
  Archive,
  ArchiveX,
} from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { formatDistanceToNow } from 'date-fns';

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
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ContactMessage } from '@/lib/types';
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
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-40 mt-1" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-48" />
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
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const messagesCollection = collection(db, 'contacts');
    const q = query(messagesCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: ContactMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedMessages.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        } as ContactMessage);
      });
      setMessages(fetchedMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  return (
    <>
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>
            Messages sent from the website contact form.
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
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <TableRow key={message.id} className={!message.isRead ? 'bg-muted/50 font-bold' : ''}>
                    <TableCell>
                      <div className="font-medium">{message.name}</div>
                      <div className="text-sm text-muted-foreground">{message.email}</div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{message.subject}</p>
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
                                    {message.isRead ? <Archive className="mr-2 h-4 w-4" /> : <Mail className="mr-2 h-4 w-4" />}
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
                ))
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
