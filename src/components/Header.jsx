'use client';

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { BUSINESS_DATA } from '../data/menuData';

export default function Header() {
  const { totalItemsCount, setIsCartOpen, liveStatus } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brand = BUSINESS_DATA.brand || {};
  const contact = BUSINESS_DATA.contact || {};
  const location = BUSINESS_DATA.location || {};

  const statusBadgeClass = liveStatus?.isOpen ? 'status-badge is-open' : 'status-badge is-closed';
  const statusBadgeText = liveStatus?.badgeText || 'Abierto Hoy: 7:00 am - 10:00 pm';

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="top-notice-bar">
        <div className="container top-notice-content">
          <div className={statusBadgeClass} id="topNoticeStatusBadge">
            <span className="pulse-dot"></span>
            <span id="topNoticeHours">{statusBadgeText}</span>
          </div>
          <div className="top-info-links">
            <span className="top-info-link" id="topNoticeLocation">
              📍 {location.cityZone || 'Chetumal, Q. Roo'}
            </span>
            <a href={`tel:${contact.phoneRaw || '+529831226847'}`} className="top-info-link" id="topNoticePhone">
              📞 {contact.phoneDisplay || '+52 983 122 6847'}
            </a>
            <a href="#contacto" className="top-info-link">
              🕒 Ver todos los horarios
            </a>
          </div>
        </div>
      </div>

      {/* Header / Barra de Navegación Principal */}
      <header className="site-header" id="siteHeader">
        <div className="container nav-inner">
          {/* Logotipo de Marca */}
          <a href="#inicio" className="brand-logo" aria-label="Cafetería María Bonita - Inicio">
            <div className="brand-icon-wrapper">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-title">{brand.name || 'María Bonita'}</span>
              <span className="brand-subtitle">{brand.tagline || 'Cafetería & Panadería'}</span>
            </div>
          </a>

          {/* Enlaces Desktop */}
          <nav aria-label="Navegación principal">
            <ul className="nav-links">
              <li><a href="#inicio" className="nav-link active">Inicio</a></li>
              <li><a href="#especiales" className="nav-link">Especialidades</a></li>
              <li><a href="#catalogo" className="nav-link">Menú Digital</a></li>
              <li><a href="#nosotros" className="nav-link">Nuestra Historia</a></li>
              <li><a href="#contacto" className="nav-link">Ubicación & Horarios</a></li>
            </ul>
          </nav>

          {/* Acciones de Cabecera */}
          <div className="header-actions">
            {/* Botón rápido para buscar */}
            <a href="#catalogo" className="search-trigger-btn" id="openSearchBtn" aria-label="Buscar en el menú">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span className="search-btn-label">Buscar</span>
              <span className="search-kbd">/</span>
            </a>

            {/* Botón del Carrito / Comanda */}
            <button
              type="button"
              className="cart-header-btn"
              id="openCartBtn"
              onClick={() => setIsCartOpen(true)}
              aria-label="Ver comanda de pedido"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span className="cart-btn-text">Mi Pedido</span>
              <span className="cart-counter" id="cartCounter">{totalItemsCount}</span>
            </button>

            {/* Hamburguesa Móvil */}
            <button
              type="button"
              className="mobile-menu-btn"
              id="mobileMenuBtn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú de navegación"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Drawer Móvil de Navegación */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`} id="mobileNavDrawer">
        <div className="mobile-nav-panel">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="brand-text">
                <span className="brand-title">{brand.name || 'María Bonita'}</span>
                <span className="brand-subtitle">{brand.tagline || 'Cafetería & Panadería'}</span>
              </div>
              <button
                type="button"
                id="closeMobileNavBtn"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '1.5rem', color: 'var(--espresso-900)', padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label="Cerrar navegación"
              >
                ✕
              </button>
            </div>
            <ul className="mobile-nav-links">
              <li><a href="#inicio" className="mobile-nav-link close-mobile-on-click" onClick={() => setMobileMenuOpen(false)}>☕ Inicio</a></li>
              <li><a href="#especiales" className="mobile-nav-link close-mobile-on-click" onClick={() => setMobileMenuOpen(false)}>⭐ Especialidades</a></li>
              <li><a href="#catalogo" className="mobile-nav-link close-mobile-on-click" onClick={() => setMobileMenuOpen(false)}>📖 Menú Digital</a></li>
              <li><a href="#nosotros" className="mobile-nav-link close-mobile-on-click" onClick={() => setMobileMenuOpen(false)}>🌿 Nuestra Historia</a></li>
              <li><a href="#contacto" className="mobile-nav-link close-mobile-on-click" onClick={() => setMobileMenuOpen(false)}>📍 Ubicación & Horarios</a></li>
            </ul>
          </div>
          <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
            <p id="mobileNavScheduleStatus" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <strong>Horario de hoy:</strong> {statusBadgeText}
            </p>
            <p id="mobileNavAddress" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {location.address || 'Av. Álvaro Obregón #168, Centro, Chetumal, Q. Roo'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
