'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import categoriesData from '../../data/categories.json';
import productsData from '../../data/products.json';
import brandData from '../../data/brand.json';
import locationData from '../../data/location.json';
import contactData from '../../data/contact.json';
import aboutData from '../../data/about.json';
import billingData from '../../data/billing.json';

const staticCategories = categoriesData;
const staticProducts = productsData;

const staticBusinessData = {
  brand: brandData.brand || {},
  logo: brandData.logo || brandData.brand?.logo || '',
  hero: brandData.hero || {},
  name: brandData.name || brandData.brand?.name || 'Cafetería Demo',
  tradeName: brandData.tradeName || brandData.brand?.tradeName || 'Cafetería Demo • Menú Digital',
  slogan: brandData.slogan || brandData.brand?.slogan || '',
  subheadline: brandData.subheadline || brandData.brand?.subheadline || '',
  location: locationData.location || {},
  mapPin: locationData.mapPin || {},
  hours: locationData.hours || [],
  scheduleStatus: locationData.scheduleStatus || { mode: 'auto' },
  topNotice: locationData.topNotice || {},
  contact: contactData.contact || {},
  socials: contactData.socials || {},
  paymentConfig: contactData.paymentConfig || { allowTransfer: true, allowCash: true },
  deliveryConfig: contactData.deliveryConfig || locationData.deliveryConfig || { deliveryFee: 35, enabled: true },
  menuSection: brandData.menuSection || {
    pretitle: '— NUESTRO MENÚ DEMO',
    titleHtml: 'Sabores para disfrutar <br /><em>en cada</em> momento.',
    title: 'Sabores para disfrutar en cada momento.',
    description: brandData.menuSubtitle || brandData.menuSection?.description || 'Café, bebidas y alimentos preparados para acompañar cada visita a nuestra cafetería demo.',
  },
  menuSubtitle: brandData.menuSubtitle || brandData.menuSection?.description || 'Café, bebidas y alimentos preparados para acompañar cada visita a nuestra cafetería demo.',
  stats: aboutData.stats || [],
  platformBilling: billingData || {},
};

const staticCafeInfo = {
  ...staticBusinessData,
  phone: staticBusinessData.contact?.phoneDisplay,
  whatsapp: staticBusinessData.contact?.whatsappNumber,
  whatsappDisplay: staticBusinessData.contact?.phoneDisplay,
  email: staticBusinessData.contact?.email,
  address: staticBusinessData.location?.address,
  reference: staticBusinessData.location?.reference,
  hours: staticBusinessData.hours,
  stats: staticBusinessData.stats,
  socials: staticBusinessData.socials,
};

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
