
'use client';
import {
    File,
    ListFilter,
    PlusCircle,
  } from 'lucide-react'
  import Image from 'next/image';
  
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
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu'

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
  
  export default function AdminCustomersPage() {
    return (
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Tabs defaultValue="all">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Filter
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>
                    Customer
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Seller</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>
                    Admin
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Export
                </span>
              </Button>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Customer
                </span>
              </Button>
            </div>
          </div>
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Customers</CardTitle>
                <CardDescription>
                  Manage your customers and view their information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Email
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Joined Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        Liam Johnson
                      </TableCell>
                       <TableCell>
                        <Badge variant="outline">Customer</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        liam@example.com
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        2023-07-12
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Emma Watson
                      </TableCell>
                       <TableCell>
                        <Badge variant="secondary">Seller</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        emma@example.com
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        2023-08-15
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground">
                  Showing <strong>1-10</strong> of <strong>124</strong> customers
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    )
  }
  