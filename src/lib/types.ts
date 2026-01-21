export type Product = {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  currency: string;
  category: string;
  subcategory?: string;
  brand: string;
  images: string[];
  specifications: Record<string, string | number>;
  stockQuantity: number;
  sku: string;
  ratings: {
    average: number;
    count: number;
  };
  isActive: boolean;
  tags: string[];
};

export type User = {
  id: string;
  displayName?: string;
  fname?: string;
  lname?: string;
  email: string;
  role: 'customer' | 'seller' | 'admin' | 'super_admin' | 'content_manager' | 'order_manager' | 'support_manager' | 'finance_manager';
  createdAt: any; // Firestore Timestamp
  photoURL?: string;
};

export type Vendor = {
  id: string;
  storeName: string;
  storeDescription: string;
  storeLogo: string;
  email: string;
  phone: string;
  address: string;
  nin: string;
  payoutDetails: {
    businessName: string;
    accountNumber: string;
    bankName: string;
  };
};

export type Category = {
  name: string;
  description?: string;
  imageURL: string;
  parentCategory?: string | null;
  isActive: boolean;
  order: number;
};

export type Review = {
  reviewId: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  helpfulCount: number;
  reported: boolean;
  user?: {
    name: string;
    avatar: string;
  };
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: any;
  isRead: boolean;
};

export type Order = {
  id: string;
  userId: string; // The customer's ID
  orderNumber: string;
  customerName?: string; // Denormalized customer name
  orderStatus: string;
  createdAt: any; // Should be a Firestore Timestamp, but 'any' for simplicity client-side
  grandTotal: number;
};
