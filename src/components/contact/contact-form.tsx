'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addContactMessage } from './actions';
import { useEffect } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Sending...' : 'Send Message'}
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(addContactMessage, {
    errors: {},
    success: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Message Sent!',
        description: "Thanks for reaching out. We'll get back to you soon.",
      });
      // Optionally reset the form here
    } else if (state.errors?._form) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: state.errors._form.join(', '),
      });
    }
  }, [state, toast]);

  return (
    <form id="contact-form" action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Enter your name" />
          {state.errors?.name && (
            <p className="text-sm text-destructive">{state.errors.name.join(', ')}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="Enter your email" />
          {state.errors?.email && (
            <p className="text-sm text-destructive">{state.errors.email.join(', ')}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" placeholder="How can we help?" />
        {state.errors?.subject && (
          <p className="text-sm text-destructive">{state.errors.subject.join(', ')}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Your message"
          className="min-h-[120px]"
        />
        {state.errors?.message && (
          <p className="text-sm text-destructive">{state.errors.message.join(', ')}</p>
        )}
      </div>
      <SubmitButton />
    </form>
  );
}
