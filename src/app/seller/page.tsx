'use client';
import {
  Activity,
  ArrowUpRight,
  Package,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

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
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import type { Product } from '@/lib/types';
import { getProductsBySeller } from '@/services/product-service';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      if (user) {
        setLoading(true);
        const sellerProducts = await getProductsBySeller(user.uid);
        setProducts(sellerProducts);
        setLoading(false);
      }
    }
    fetchProducts();
  }, [user]);

  const dashboardStats = useMemo(() => {
    const activeProducts = products.filter(p => p.isActive).length;
    // Other stats are static for now
    return {
      activeProducts,
      totalRevenue: '₦45,231.89',
      sales: '+12,234',
      totalOrders: '+2350',
    };
  }, [products]);

  const recentProducts = products.slice(0, 5);

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month (Static)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.sales}</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month (Static)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded-md bg-muted"></div>
            ) : (
              <div className="text-2xl font-bold">{dashboardStats.activeProducts}</div>
            )}
            <p className="text-xs text-muted-foreground">
              of {products.length} total products
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              (Static Data)
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Your Recent Products</CardTitle>
              <CardDescription>
                A quick look at products you manage.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/seller/products">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden xl:table-column">
                    Status
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Stock
                  </TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 w-32 animate-pulse rounded-md bg-muted"></div></TableCell>
                      <TableCell className="hidden xl:table-column"><div className="h-4 w-16 animate-pulse rounded-md bg-muted"></div></TableCell>
                      <TableCell className="hidden md:table-cell"><div className="h-4 w-12 animate-pulse rounded-md bg-muted"></div></TableCell>
                      <TableCell className="text-right"><div className="h-4 w-20 ml-auto animate-pulse rounded-md bg-muted"></div></TableCell>
                    </TableRow>
                  ))
                ) : recentProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {product.brand}
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                      <Badge className="text-xs" variant={product.isActive ? 'default' : 'outline'}>
                        {product.isActive ? 'Active' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.stockQuantity}
                    </TableCell>
                    <TableCell className="text-right">₦{product.price.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
             <CardDescription>
                This is static data for now.
              </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8">
            <div className="flex items-center gap-4">
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  Olivia Martin
                </p>
                <p className="text-sm text-muted-foreground">
                  olivia.martin@email.com
                </p>
              </div>
              <div className="ml-auto font-medium">+₦1,999.00</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  Jackson Lee
                </p>
                <p className="text-sm text-muted-foreground">
                  jackson.lee@email.com
                </p>
              </div>
              <div className="ml-auto font-medium">+₦39.00</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
