'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'recentlyViewedProducts';
const MAX_RECENTLY_VIEWED = 10;

export const useRecentlyViewed = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getRecentlyViewed = useCallback((): string[] => {
    if (!isClient) return [];
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return [];
    }
  }, [isClient]);

  const addRecentlyViewed = useCallback((productId: string) => {
    if (!isClient) return;
    try {
      const currentItems = getRecentlyViewed();
      // Remove the product if it already exists to move it to the front
      const updatedItems = currentItems.filter(id => id !== productId);
      // Add the new product to the beginning
      updatedItems.unshift(productId);
      // Limit the number of items
      const finalItems = updatedItems.slice(0, MAX_RECENTLY_VIEWED);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(finalItems));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [isClient, getRecentlyViewed]);

  return { getRecentlyViewed, addRecentlyViewed };
};
