

export type CartItem = {
    productId: string;
    quantity: number;
}

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
  createdAt?: string;
  updatedAt?: string;
};

export type User = {
  id: string;
  displayName?: string;
  fname?: string;
  lname?: string;
  email: string;
  role: 'customer' | 'seller' | 'admin' | 'super_admin' | 'content_manager' | 'order_manager' | 'support_manager' | 'finance_manager';
  createdAt: string;
  photoURL?: string;
  cart?: CartItem[];
  wishlist?: string[];
};

export type Vendor = {
  id: string;
  storeName: string;
  storeDescription: string;
  storeLogo: string;
  email: string;
  phone: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  nin: string;
  payoutDetails: {
    businessName: string;
    accountNumber: string;
    bankName: string;
  };
  businessLicenseUrl?: string;
  taxId?: string;
  sellerHistory?: string;
  compliance?: {
    riskScore: number;
    justification: string;
    reviewedBy: string;
    reviewedAt: string;
  };
  createdAt?: string;
  updatedAt?: string;
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
  createdAt: string;
  isRead: boolean;
};

export type Order = {
  id: string;
  userId: string; // The customer's ID
  orderNumber: string;
  customerName?: string; // Denormalized customer name
  orderStatus: string;
  createdAt: string;
  grandTotal: number;
};
