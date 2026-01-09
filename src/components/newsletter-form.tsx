'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addNewsletterSubscriber } from './actions/newsletter-actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Subscribing...' : 'Subscribe'}
    </Button>
  );
}

export function NewsletterForm() {
  const [state, formAction] = useActionState(addNewsletterSubscriber, {
    error: null,
    success: false,
  });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Subscribed!',
        description: 'Thanks for joining our newsletter.',
      });
      formRef.current?.reset();
    } else if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="flex w-full max-w-md items-center space-x-2">
      <Input
        type="email"
        name="email"
        placeholder="Enter your email"
        required
        className="flex-1"
      />
      <SubmitButton />
    </form>
  );
}

    