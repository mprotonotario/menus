'use client';

import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Specials from '../components/Specials';
import MenuCatalog from '../components/MenuCatalog';
import AboutSection from '../components/AboutSection';
import LocationSection from '../components/LocationSection';
import Footer from '../components/Footer';
import DishDetailModal from '../components/DishDetailModal';
import CartDrawer from '../components/CartDrawer';
import Toast from '../components/Toast';
import { useCart } from '../context/CartContext';

export default function Home() {
  const { totalItemsCount, cartSubtotal, setIsCartOpen, formatMoney } = useCart();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Specials />
        <MenuCatalog />
        <AboutSection />
        <LocationSection />
      </main>
      <Footer />

      {/* Botón Flotante Móvil (FAB) */}
      <button
        type="button"
        className="fab-order-button"
        id="fabOrderBtn"
        onClick={() => setIsCartOpen(true)}
        aria-label="Ver comanda de pedido"
        style={{ display: totalItemsCount > 0 ? 'flex' : undefined }}
      >
        <span>🛒 Mi Selección</span>
        <span className="cart-counter" id="fabCartCounter">{totalItemsCount}</span>
        <span id="fabCartTotal" style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem' }}>
          {formatMoney(cartSubtotal)}
        </span>
      </button>

      {/* Modales y Drawers Globales */}
      <DishDetailModal />
      <CartDrawer />
      <Toast />
    </>
  );
}
