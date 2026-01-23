'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addReview } from '@/app/(main)/products/[slug]/actions';
import { useAuth } from '@/context/auth-context';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="mt-4">
      {pending ? 'Submitting...' : 'Submit Review'}
    </Button>
  );
}

interface ReviewFormProps {
    productId: string;
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [state, formAction] = useActionState(addReview, {
    success: false,
    errors: {},
    message: undefined
  });

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Review Submitted!',
        description: 'Thank you for your feedback.',
      });
      formRef.current?.reset();
      setRating(0);
    } else if (state.message) {
      toast({
        variant: 'destructive',
        title: 'Error submitting review',
        description: state.message,
      });
    }
  }, [state, toast]);

  if (loading) {
      return null; // Or a skeleton
  }

  if (!user) {
    return (
        <div className="text-center text-muted-foreground p-8 border rounded-lg bg-muted/20">
            <p>You must be logged in to write a review.</p>
            <Button asChild variant="link" className="mt-2">
                <Link href={`/login?redirect=/products/${productId}`}>Log in to continue</Link>
            </Button>
        </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="userId" value={user.uid} />
      <input type="hidden" name="userName" value={userData?.displayName || user.displayName || 'Anonymous'} />
      <input type="hidden" name="userPhotoURL" value={userData?.photoURL || user.photoURL || ''} />
      
      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                'h-6 w-6 cursor-pointer transition-colors',
                (hoverRating || rating) >= star
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              )}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          ))}
        </div>
         <input type="hidden" name="rating" value={rating} />
         {state.errors?.rating && (
            <p className="text-sm text-destructive">{state.errors.rating.join(', ')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Review Title</Label>
        <Input id="title" name="title" placeholder="e.g. Best headphones I've ever owned!" />
        {state.errors?.title && (
            <p className="text-sm text-destructive">{state.errors.title.join(', ')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Your Review</Label>
        <Textarea id="comment" name="comment" placeholder="Tell us more about your experience..." />
         {state.errors?.comment && (
            <p className="text-sm text-destructive">{state.errors.comment.join(', ')}</p>
        )}
      </div>
      <SubmitButton />
    </form>
  );
}
