'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { Cart, Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

// Note: This is not in the original types.ts, so we define it locally.
// A more robust solution would be to add this to the global types.
type CartItem = {
  productId: string;
  quantity: number;
};

type EnrichedCartItem = CartItem & { productDetails?: Product; id: string };

export default function CartPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [enrichedItems, setEnrichedItems] = useState<EnrichedCartItem[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  const cartRef = useMemoFirebase(
    () =>
      firestore && user
        ? doc(firestore, 'users', user.uid, 'carts', 'default')
        : null,
    [firestore, user]
  );
  const { data: cart, isLoading: isCartLoading } = useDoc<Cart>(cartRef);

  useEffect(() => {
    if (cart && cart.items && firestore) {
      setIsLoadingDetails(true);
      const fetchProductDetails = async () => {
        if (!cart.items) {
          setEnrichedItems([]);
          setIsLoadingDetails(false);
          return;
        }
        const itemsWithDetails = await Promise.all(
          cart.items.map(async (item) => {
            const productRef = doc(firestore, 'products', item.productId);
            const productSnap = await getDoc(productRef);
            return {
              ...item,
              id: item.productId,
              productDetails: productSnap.exists()
                ? (productSnap.data() as Product)
                : undefined,
            };
          })
        );
        setEnrichedItems(itemsWithDetails);
        setIsLoadingDetails(false);
      };
      fetchProductDetails();
    } else if (!isCartLoading) {
      setEnrichedItems([]);
      setIsLoadingDetails(false);
    }
  }, [cart, firestore, isCartLoading]);

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (!cartRef || !cart || !cart.items) return;
    const updatedItems = cart.items
      .map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
      .filter((item) => item.quantity > 0);
    await updateDoc(cartRef, { items: updatedItems });
  };

  const removeItem = async (productId: string) => {
    if (!cartRef || !cart || !cart.items) return;
    const updatedItems = cart.items.filter(
      (item) => item.productId !== productId
    );
    await updateDoc(cartRef, { items: updatedItems });
  };

  const subtotal = enrichedItems.reduce((acc, item) => {
    const price = item.productDetails?.discountedPrice || item.productDetails?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const isLoading = isCartLoading || isLoadingDetails;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-8">
           <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
           </div>
           <div className="md:col-span-1">
             <Skeleton className="h-64 w-full" />
           </div>
        </div>
      ) : enrichedItems.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {enrichedItems.map((item) =>
              item.productDetails ? (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Image
                    src={item.productDetails.images[0]}
                    alt={item.productDetails.name}
                    width={100}
                    height={100}
                    className="rounded-md object-cover"
                  />
                  <div className="flex-grow">
                    <Link href={`/products/${item.id}`} className="font-semibold hover:underline">
                      {item.productDetails.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                       ₦{(item.productDetails.discountedPrice || item.productDetails.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center border rounded-md">
                     <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-4 font-bold">{item.quantity}</span>
                      <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                  </div>
                  <p className="font-semibold w-20 text-right">
                    ₦{((item.productDetails.discountedPrice || item.productDetails.price) * item.quantity).toFixed(2)}
                  </p>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                </div>
              ) : null
            )}
          </div>
          <div className="md:col-span-1">
            <div className="p-6 border rounded-lg sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2">
                 <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                 <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₦{subtotal.toFixed(2)}</span>
              </div>
               <Button className="w-full mt-6" size="lg">Proceed to Checkout</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-6 text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
