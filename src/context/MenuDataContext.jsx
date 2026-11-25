'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  BUSINESS_DATA as staticBusinessData,
  CAFE_INFO as staticCafeInfo,
  MENU_CATEGORIES as staticCategories,
  MENU_ITEMS as staticProducts,
} from '../data/menuData';

const MenuDataContext = createContext({
  categories: staticCategories,
  products: staticProducts,
  businessData: staticBusinessData,
  cafeInfo: staticCafeInfo,
  isLoading: false,
  reloadMenuData: () => {},
});

export function MenuDataProvider({ children }) {
  const [categories, setCategories] = useState(staticCategories);
  const [products, setProducts] = useState(staticProducts);
  const [businessData, setBusinessData] = useState(staticBusinessData);
  const [cafeInfo, setCafeInfo] = useState(staticCafeInfo);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLiveMenuData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/menu-data', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.success) {
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
        if (Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
        if (data.businessData && typeof data.businessData === 'object') {
          setBusinessData(data.businessData);
          if (typeof window !== 'undefined') {
            window.BUSINESS_DATA = data.businessData;
          }
        }
        if (data.cafeInfo && typeof data.cafeInfo === 'object') {
          setCafeInfo(data.cafeInfo);
          if (typeof window !== 'undefined') {
            window.CAFE_INFO = data.cafeInfo;
          }
        }
      }
    } catch (err) {
      console.warn('Usando datos pre-cargados (no se pudo sincronizar /api/menu-data):', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveMenuData();
  }, [fetchLiveMenuData]);

  return (
    <MenuDataContext.Provider
      value={{
        categories,
        products,
        businessData,
        cafeInfo,
        isLoading,
        reloadMenuData: fetchLiveMenuData,
      }}
    >
      {children}
    </MenuDataContext.Provider>
  );
}

export function useMenuData() {
  const context = useContext(MenuDataContext);
  if (!context) {
    return {
      categories: staticCategories,
      products: staticProducts,
      businessData: staticBusinessData,
      cafeInfo: staticCafeInfo,
      isLoading: false,
      reloadMenuData: () => {},
    };
  }
  return context;
}
