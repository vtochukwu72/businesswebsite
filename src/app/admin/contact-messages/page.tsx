'use client';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  type WithId,
} from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { ContactMessage } from '@/lib/types';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function AdminContactMessagesPage() {
  const firestore = useFirestore();

  const messagesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'contacts'), orderBy('createdAt', 'desc'))
        : null,
    [firestore]
  );
  const { data: messages, isLoading } =
    useCollection<ContactMessage>(messagesQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Messages</CardTitle>
        <CardDescription>
          Inquiries and complaints from customers. Respond via email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : messages && messages.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {messages.map((message) => (
              <AccordionItem value={message.id} key={message.id}>
                <AccordionTrigger>
                  <div className="grid grid-cols-4 gap-4 text-left w-full">
                    <span className="truncate font-medium">{message.name}</span>
                    <span className="truncate text-muted-foreground">
                      {message.subject}
                    </span>
                    <span className="truncate text-muted-foreground col-span-2">
                       {new Date(
                        (message.createdAt as any).seconds * 1000
                      ).toLocaleString()}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 bg-muted/50 rounded-md">
                     <p className="mb-4">{message.message}</p>
                     <Button asChild>
                      <a href={`mailto:${message.email}?subject=Re: ${message.subject}`}>
                        Reply to {message.email}
                      </a>
                     </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <h3 className="text-lg font-semibold">No messages found.</h3>
            <p>New messages from the contact form will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
