export type User = {
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  role: 'customer' | 'seller' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  shippingAddresses: ShippingAddress[];
  paymentMethods: PaymentMethod[];
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
  cartTotal: number;
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
