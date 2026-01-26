'use client';
import { File, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { collection, onSnapshot, query } from 'firebase/firestore';
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
import type { Product, Vendor } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { serializeFirestoreData } from '@/lib/utils';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


function ProductRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="hidden sm:table-cell">
        <Skeleton className="aspect-square rounded-md object-cover h-16 w-16" />
      </TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
    </TableRow>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Map<string, Vendor>>(new Map());
  const [productsLoading, setProductsLoading] = useState(true);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  const loading = productsLoading || vendorsLoading;

  useEffect(() => {
    setProductsLoading(true);
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedProducts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...serializeFirestoreData(doc.data()),
        } as Product));
        setProducts(fetchedProducts);
        setProductsLoading(false);
    }, (error) => {
      const permissionError = new FirestorePermissionError({
        path: 'products',
        operation: 'list'
      }, error);
      errorEmitter.emit('permission-error', permissionError);
      console.error("Error fetching products: ", error);
      toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "Could not load product data."
      });
      setProductsLoading(false);
    });
    
    return () => unsubscribe();
  }, [toast]);

  useEffect(() => {
    setVendorsLoading(true);
    const q = query(collection(db, 'vendors'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const vendorMap = new Map<string, Vendor>();
        snapshot.forEach((doc) => {
            vendorMap.set(doc.id, { id: doc.id, ...serializeFirestoreData(doc.data()) } as Vendor);
        });
        setVendors(vendorMap);
        setVendorsLoading(false);
    }, (error) => {
        const permissionError = new FirestorePermissionError({
            path: 'vendors',
            operation: 'list'
        }, error);
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error fetching vendors: ", error);
        toast({
            variant: "destructive",
            title: "Permission Denied",
            description: "Could not load vendor data."
        });
        setVendorsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);


  const filteredProducts = useMemo(() => {
    if (filter === 'all') return products;
    if (filter === 'active') return products.filter(p => p.isActive);
    if (filter === 'draft') return products.filter(p => !p.isActive);
    if (filter === 'archived') return []; // No archived state yet
    return products;
  }, [products, filter]);

  const getSellerName = (sellerId: string) => {
    return vendors.get(sellerId)?.storeName || sellerId;
  }
  
  const handleExport = () => {
    const dataToExport = filteredProducts.map(product => ({
      'Product Name': product.name,
      'Status': product.isActive ? 'Active' : 'Draft',
      'Price (₦)': product.price.toFixed(2),
      'Seller': getSellerName(product.sellerId),
      'Stock': product.stockQuantity,
      'Featured': product.isFeatured ? 'Yes' : 'No',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, `products-export-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Tabs defaultValue="all" onValueChange={setFilter}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="archived" className="hidden sm:flex">
              Archived
            </TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button 
                size="sm" 
                variant="outline" 
                className="h-8 gap-1"
                onClick={handleExport}
                disabled={loading || filteredProducts.length === 0}
            >
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Product
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value={filter}>
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Manage all products on the platform and view their performance.
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
                      Seller
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
                    </>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <TableRow key={product.id}>
                        <TableCell className="hidden sm:table-cell">
                          <Image
                            alt={product.name}
                            className="aspect-square rounded-md object-cover"
                            height="64"
                            src={product.images?.[0] || 'https://placehold.co/64x64'}
                            width="64"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.isActive ? 'default' : 'outline'}>{product.isActive ? 'Active' : 'Draft'}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          ₦{product.price.toFixed(2)}
                        </TableCell>
                         <TableCell className="hidden md:table-cell">
                          {getSellerName(product.sellerId)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {product.stockQuantity}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                     <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No products found.
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
