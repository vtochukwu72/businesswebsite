

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
  shippingFee?: number;
  currency: string;
  category: string;
  subcategory?: string;
  brand: string;
  images: string[];
  colors?: string[];
  specifications: Record<string, string | number>;
  stockQuantity: number;
  sku: string;
  ratings: {
    average: number;
    count: number;
  };
  isActive: boolean;
  isFeatured?: boolean;
  tags: string[];
  carouselHeadline?: string;
  carouselDescription?: string;
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

export type PayoutDetails = {
    businessName: string;
    accountNumber: string;
    bankName: string;
    subaccountCode: string;
}

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
  payoutDetails: PayoutDetails;
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
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  userName: string;
  userPhotoURL?: string;
  status: 'pending' | 'approved' | 'rejected';
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

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type Order = {
  id: string;
  userId: string; // The customer's ID
  vendorId: string; // The vendor's ID for this sub-order
  orderNumber: string;
  customerName?: string; // Denormalized customer name
  customerEmail?: string; // Denormalized customer email
  items: OrderItem[];
  shippingAddress: any;
  orderStatus: string;
  createdAt: string;
  totalAmount: number;
  shippingFee: number;
  taxAmount: number;
  grandTotal: number;
  paymentDetails: {
    method: string;
    status: string;
  };
};

    

    

    