'use client';

import {
  useUser,
  useCollection,
  useFirestore,
  useMemoFirebase,
  type WithId,
} from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Review } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SellerReviewsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // This query is a simplification. In a real app, you would need a way to link reviews to a seller.
  // This could be done by denormalizing sellerId into the review document.
  // For now, we will fetch all reviews.
  const reviewsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'reviews')) : null),
    [firestore]
  );
  const { data: reviews, isLoading } = useCollection<Review>(reviewsQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Reviews</CardTitle>
        <CardDescription>
          See what customers are saying about your products.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          ))}

        {reviews?.map((review) => (
          <div key={review.id} className="flex gap-4">
            <Avatar>
              <AvatarImage
                src={review.user?.avatar}
                alt={review.user?.name}
                data-ai-hint="person portrait"
              />
              <AvatarFallback>{review.user?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{review.user?.name || 'Anonymous'}</h4>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                on Product: {review.productId}
              </p>
              <h5 className="font-bold mt-1">{review.title}</h5>
              <p className="text-muted-foreground mt-1">{review.comment}</p>
            </div>
          </div>
        ))}

        {!isLoading && reviews?.length === 0 && (
           <div className="py-12 text-center text-muted-foreground">
            <h3 className="text-lg font-semibold">No reviews yet.</h3>
            <p>Customer reviews on your products will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
