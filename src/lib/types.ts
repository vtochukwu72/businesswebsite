import type { Timestamp } from 'firebase/firestore';

export type User = {
  userId: string;
  email: string;
  fname: string;
  lname: string;
  phoneNumber: string;
  role: 'customer' | 'vendor' | 'admin';
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin: Timestamp;
  status: 'active' | 'suspended' | 'pending_verification';
  // Admin-specific
  permissions?: string[];
  adminLevel?: 'super_admin' | 'admin' | 'support';
  lastActivity?: Timestamp;
  ipWhitelist?: string[];
  twoFactorEnabled?: boolean;
  // Vendor-specific
  storeName?: string;
  accountNumber?: string;
  nin?: string;
  businessInfo?: {
    businessName: string;
    taxId: string;
    businessType: 'individual' | 'company';
    registrationNumber: string;
  };
  storeSettings?: {
    storeSlug: string;
    storeDescription: string;
    storeLogo: string;
    storeBanner: string;
    storeContact: {
      address: string;
      city: string;
      state: string;
      country: string;
    };
  };
  verificationStatus?: {
    idVerified: boolean;
    bankVerified: boolean;
    ninVerified: boolean;
    verifiedBy: string | null;
    verifiedAt: Timestamp | null;
  };
  commissionRate?: number;
  subscription?: {
    plan: 'basic' | 'premium';
    status: 'active' | 'inactive';
    expiresAt: Timestamp;
  };
};

export type ShippingAddress = {
  addressId: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
};

export type PaymentMethod = {
  cardId: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
};

export type Product = {
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
  specifications: Record<string, string>;
  stockQuantity: number;
  sku: string;
  ratings: {
    average: number;
    count: number;
  };
  isActive: boolean;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  updatedAt: {
    seconds: number;
    nanoseconds: number;
  };
  tags: string[];
};

export type Category = {
  name: string;
  description?: string;
  imageURL: string;
  parentCategory?: string | null;
  isActive: boolean;
  order: number;
};

export type CartItem = {
  productId: string;
  quantity: number;
  addedAt: Date;
  priceAtAddition: number;
  sellerId: string;
};

export type Cart = {
  userId: string;
  items: CartItem[];
  updatedAt: Date;
};

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sellerId: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
};

export type Order = {
  orderId: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentDetails: {
    method: 'card' | 'cash_on_delivery' | 'bank_transfer';
    status: 'pending' | 'completed' | 'failed';
    transactionId?: string | null;
    amount: number;
  };
  orderStatus:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  totalAmount: number;
  shippingFee: number;
  taxAmount: number;
  grandTotal: number;
  createdAt: Date;
  estimatedDelivery: Date;
  deliveryNotes?: string;
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
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name: string;
    avatar: string;
  };
};

export type WishlistItem = {
  productId: string;
  addedAt: Date;
};

export type Wishlist = {
  userId: string;
  items: WishlistItem[];
  updatedAt: Date;
};

export type Vendor = {
  id: string;
  storeName: string;
  storeDescription?: string;
  storeLogo?: string;
  email: string;
  phone?: string;
  address?: string;
  status: 'pending' | 'approved' | 'suspended';
};

export type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};
