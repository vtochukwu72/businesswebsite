import type { Product } from './types';

export const products: Product[] = [
  {
    id: 'prod-1',
    sellerId: 'seller-1',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Immerse yourself in sound with these premium noise-cancelling headphones. Long battery life and comfortable design for all-day listening.',
    price: 349.99,
    discountedPrice: 299.99,
    currency: 'NGN',
    category: 'Electronics',
    brand: 'SoundWave',
    images: [
      'https://picsum.photos/seed/101/800/800',
      'https://picsum.photos/seed/102/800/800',
      'https://picsum.photos/seed/103/800/800',
    ],
    specifications: {
      'Connectivity': 'Bluetooth 5.0',
      'Battery Life': '30 hours',
      'Noise Cancellation': 'Active Noise Cancellation',
      'Weight': '250g'
    },
    stockQuantity: 150,
    sku: 'SW-WH1000',
    ratings: {
      average: 4.8,
      count: 1250,
    },
    isActive: true,
    tags: ['headphones', 'audio', 'wireless'],
  },
  {
    id: 'prod-2',
    sellerId: 'seller-2',
    name: 'Classic Leather Watch',
    description: 'A timeless timepiece that combines classic design with modern functionality. Features a genuine leather strap and stainless steel case.',
    price: 199.99,
    currency: 'NGN',
    category: 'Fashion',
    brand: 'Timeless Co.',
    images: [
      'https://picsum.photos/seed/104/800/800',
      'https://picsum.photos/seed/105/800/800',
    ],
    specifications: {
      'Case Material': 'Stainless Steel',
      'Strap Material': 'Genuine Leather',
      'Water Resistance': '5 ATM',
      'Movement': 'Quartz'
    },
    stockQuantity: 80,
    sku: 'TC-LW2024',
    ratings: {
      average: 4.6,
      count: 890,
    },
    isActive: true,
    tags: ['watch', 'fashion', 'accessory'],
  },
  {
    id: 'prod-3',
    sellerId: 'seller-1',
    name: 'Smart Home Hub',
    description: 'Control your smart devices with ease using this central hub. Compatible with all major brands and voice assistants.',
    price: 129.99,
    currency: 'NGN',
    category: 'Electronics',
    brand: 'Connectify',
    images: [
      'https://picsum.photos/seed/106/800/800',
    ],
    specifications: {
      'Compatibility': 'Wi-Fi, Zigbee, Z-Wave',
      'Voice Assistants': 'Google Assistant, Amazon Alexa',
      'Power': 'USB-C'
    },
    stockQuantity: 200,
    sku: 'CN-HH200',
    ratings: {
      average: 4.5,
      count: 950,
    },
    isActive: true,
    tags: ['smart home', 'iot', 'hub'],
  },
  {
    id: 'prod-4',
    sellerId: 'seller-3',
    name: 'Organic Green Tea',
    description: 'A refreshing and healthy blend of organic green tea leaves. Sourced from the finest tea gardens.',
    price: 15.99,
    currency: 'NGN',
    category: 'Groceries',
    brand: 'PureLeaf',
    images: [
      'https://picsum.photos/seed/107/800/800',
    ],
    specifications: {
      'Ingredients': 'Organic Green Tea Leaves',
      'Weight': '100g',
      'Caffeine': 'Low'
    },
    stockQuantity: 500,
    sku: 'PL-GT100',
    ratings: {
      average: 4.9,
      count: 2300,
    },
    isActive: true,
    tags: ['tea', 'organic', 'beverage'],
  },
  {
    id: 'prod-5',
    sellerId: 'seller-2',
    name: 'Modern Running Shoes',
    description: 'Lightweight and breathable running shoes designed for maximum comfort and performance.',
    price: 120.00,
    currency: 'NGN',
    category: 'Fashion',
    brand: 'QuickStep',
    images: [
        'https://picsum.photos/seed/108/800/800',
        'https://picsum.photos/seed/109/800/800',
    ],
    specifications: {
        'Upper Material': 'Mesh',
        'Sole': 'Rubber',
        'Use': 'Running, Gym'
    },
    stockQuantity: 300,
    sku: 'QS-RUN-21',
    ratings: {
        average: 4.7,
        count: 1500
    },
    isActive: true,
    tags: ['shoes', 'running', 'sport']
  },
  {
    id: 'prod-6',
    sellerId: 'seller-4',
    name: 'The Alchemist',
    description: 'A classic novel by Paulo Coelho. A story about following your dreams.',
    price: 9.99,
    currency: 'NGN',
    category: 'Books',
    brand: 'HarperCollins',
    images: [
        'https://picsum.photos/seed/110/800/800',
    ],
    specifications: {
        'Author': 'Paulo Coelho',
        'Format': 'Paperback',
        'Pages': 208
    },
    stockQuantity: 1000,
    sku: 'BK-9780061122415',
    ratings: {
        average: 4.7,
        count: 25000
    },
    isActive: true,
    tags: ['book', 'fiction', 'classic']
  }
];
