
'use client';
import {
    File,
    PlusCircle,
  } from 'lucide-react'
  import Image from 'next/image';
  import Link from 'next/link';
  import { useEffect, useState, useMemo } from 'react';
  import { collection, query, where, onSnapshot } from 'firebase/firestore';
  import { db } from '@/firebase/config';
  
  import { Badge } from '@/components/ui/badge'
  import { Button } from '@/components/ui/button'
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card'
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table'
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from '@/components/ui/tabs'
  import { useAuth } from '@/context/auth-context';
  import type { Product } from '@/lib/types';
  import { Skeleton } from '@/components/ui/skeleton';
  import { useToast } from '@/hooks/use-toast';
  
  function ProductRowSkeleton() {
    return (
      <TableRow>
        <TableCell className="hidden sm:table-cell">
          <Skeleton className="aspect-square rounded-md object-cover h-16 w-16" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-32" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-6 w-16" />
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <Skeleton className="h-4 w-12" />
        </TableCell>
      </TableRow>
    );
  }

  export default function SellerProductsPage() {
    const { user, loading: authLoading } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { toast } = useToast();

    const loading = authLoading || productsLoading;

    useEffect(() => {
        if (!user) {
          setProductsLoading(false);
          return;
        }
    
        setProductsLoading(true);
        const productsCollection = collection(db, 'products');
        const q = query(productsCollection, where('sellerId', '==', user.uid));
    
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedProducts: Product[] = [];
          querySnapshot.forEach((doc) => {
            fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
          });
          setProducts(fetchedProducts);
          setProductsLoading(false);
        }, (error) => {
            console.error("Error fetching real-time products: ", error);
            toast({
                variant: 'destructive',
                title: 'Error Loading Products',
                description: 'Could not load your products. Please try again later.',
            });
            setProducts([]);
            setProductsLoading(false);
        });
    
        // Cleanup subscription on unmount
        return () => unsubscribe();
      }, [user, toast]);

    const filteredProducts = useMemo(() => {
      if (filter === 'all') return products;
      if (filter === 'active') return products.filter(p => p.isActive);
      if (filter === 'draft') return products.filter(p => !p.isActive);
      return products;
    }, [products, filter]);

    return (
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Tabs defaultValue="all" onValueChange={setFilter}>
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Export
                </span>
              </Button>
              <Button asChild size="sm" className="h-8 gap-1">
                <Link href="/seller/products/new">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Product
                  </span>
                </Link>
              </Button>
            </div>
          </div>
          <TabsContent value={filter}>
            <Card>
              <CardHeader>
                <CardTitle>Your Products</CardTitle>
                <CardDescription>
                  Manage your products and view their sales performance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden w-[100px] sm:table-cell">
                        <span className="sr-only">Image</span>
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Price
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Stock
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <>
                        <ProductRowSkeleton />
                        <ProductRowSkeleton />
                        <ProductRowSkeleton />
                        <ProductRowSkeleton />
                      </>
                    ) : filteredProducts.length > 0 ? (
                      filteredProducts.map(product => (
                        <TableRow key={product.id}>
                          <TableCell className="hidden sm:table-cell">
                            <Image
                              alt={product.name}
                              className="aspect-square rounded-md object-cover"
                              height="64"
                              src={product.images[0] || 'https://placehold.co/64x64'}
                              width="64"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.isActive ? 'default' : 'outline'}>
                              {product.isActive ? 'Active' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            ₦{product.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {product.stockQuantity}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No products found. Add a product to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Showing <strong>1-{filteredProducts.length}</strong> of <strong>{filteredProducts.length}</strong> products
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    )
  }
