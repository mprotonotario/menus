'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useMenuData } from '../context/MenuDataContext';

const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio', icon: '☕' },
  { id: 'especiales', label: 'Especialidades', icon: '⭐' },
  { id: 'catalogo', label: 'Menú Digital', icon: '📖' },
  { id: 'nosotros', label: 'Nuestra Historia', icon: '🌿' },
  { id: 'contacto', label: 'Ubicación & Horarios', icon: '📍' },
];

export default function Header() {
  const { totalItemsCount, setIsCartOpen, liveStatus } = useCart();
  const { businessData: BUSINESS_DATA } = useMenuData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const [isScrolled, setIsScrolled] = useState(false);

  const brand = BUSINESS_DATA.brand || {};
  const contact = BUSINESS_DATA.contact || {};
  const location = BUSINESS_DATA.location || {};

  const isPlatformSuspended = Boolean(BUSINESS_DATA.platformBilling?.isSuspended);
  const statusBadgeClass = isPlatformSuspended
    ? 'status-badge is-closed'
    : liveStatus?.isOpen
    ? 'status-badge is-open'
    : 'status-badge is-closed';
  const statusBadgeText = isPlatformSuspended
    ? 'Pedidos pausados temporalmente'
    : liveStatus?.badgeText || 'Abierto Hoy: 7:00 am - 10:00 pm';

  // Scrollspy: detecta automáticamente en qué sección nos encontramos
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 30);

      // Si el usuario llega al final de la página, activa la última sección (contacto)
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      if (windowHeight + scrollPosition >= fullHeight - 80) {
        setActiveSection('contacto');
        return;
      }

      // Offset considerando el header sticky (aprox 120px)
      const headerOffset = 140;
      const sectionIds = ['contacto', 'nosotros', 'catalogo', 'especiales', 'inicio'];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop - headerOffset;
          if (scrollPosition >= top) {
            setActiveSection(id);
            return;
          }
        }
      }

      setActiveSection('inicio');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navegación suave al hacer clic en los enlaces
  const scrollToSection = useCallback(
    (e, id) => {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        const headerOffset = 85;
        const elementPosition = el.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = Math.max(0, elementPosition - headerOffset);

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
        setActiveSection(id);
        window.history.pushState(null, '', `#${id}`);
      }
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    },
    [mobileMenuOpen]
  );

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
            <a
              href="#contacto"
              className="top-info-link"
              onClick={(e) => scrollToSection(e, 'contacto')}
            >
              🕒 Ver todos los horarios
            </a>
          </div>
        </div>
      </div>

      {/* Header / Barra de Navegación Principal con efecto scrolled */}
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`} id="siteHeader">
        <div className="container nav-inner">
          {/* Logotipo de Marca */}
          <a
            href="#inicio"
            className="brand-logo"
            aria-label="Cafetería María Bonita - Inicio"
            onClick={(e) => scrollToSection(e, 'inicio')}
          >
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

          {/* Enlaces Desktop Dinámicos con ScrollSpy */}
          <nav aria-label="Navegación principal">
            <ul className="nav-links">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                    onClick={(e) => scrollToSection(e, item.id)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Acciones de Cabecera */}
          <div className="header-actions">
            {/* Botón rápido para buscar */}
            <a
              href="#catalogo"
              className="search-trigger-btn"
              id="openSearchBtn"
              aria-label="Buscar en el menú"
              onClick={(e) => scrollToSection(e, 'catalogo')}
            >
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
                style={{
                  fontSize: '1.5rem',
                  color: 'var(--espresso-900)',
                  padding: '0.5rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                aria-label="Cerrar navegación"
              >
                ✕
              </button>
            </div>
            <ul className="mobile-nav-links">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`mobile-nav-link close-mobile-on-click ${activeSection === item.id ? 'active' : ''}`}
                    style={activeSection === item.id ? { color: 'var(--terracotta-600)' } : undefined}
                    onClick={(e) => scrollToSection(e, item.id)}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
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
