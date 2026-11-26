'use client';

import React from 'react';
import { useMenuData } from '../context/MenuDataContext';

export default function Footer() {
  const { businessData: BUSINESS_DATA } = useMenuData();
  const brand = BUSINESS_DATA.brand || {};
  const socials = BUSINESS_DATA.socials || {};

  const brandLogoRaw = brand.logo || BUSINESS_DATA.logo;
  const brandLogo = brandLogoRaw
    ? brandLogoRaw.replace(/\\/g, '/').startsWith('/')
      ? brandLogoRaw.replace(/\\/g, '/')
      : `/${brandLogoRaw.replace(/\\/g, '/')}`
    : null;

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="brand-logo" style={{ marginBottom: '0.5rem' }}>
              {brandLogo ? (
                <img
                  src={brandLogo}
                  alt={brand.name || 'Logo Cafetería'}
                  className="brand-logo-img"
                  style={{ border: '2px solid rgba(255, 255, 255, 0.2)' }}
                />
              ) : (
                <div className="brand-icon-wrapper" style={{ background: 'var(--terracotta-500)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                  </svg>
                </div>
              )}
              <div className="brand-text">
                <span className="brand-title" style={{ color: '#ffffff' }}>{brand.title || brand.name || 'Cafetería Demo'}</span>
                <span className="brand-subtitle" style={{ color: 'var(--caramel-500)' }}>{brand.subtitle || brand.tagline || 'Menú Digital & Pedidos'}</span>
              </div>
            </div>
            <p id="footerBrandDesc">
              Cafetería y panadería de especialidad. Conservando las recetas de la abuela con granos seleccionados de los
              mejores cafetales de México.
            </p>
            <div className="footer-social-links">
              <a
                id="footerSocialInstagram"
                href={socials.instagram || 'https://instagram.com/cafeteriamariabonita'}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                id="footerSocialFacebook"
                href={socials.facebook || 'https://facebook.com/cafeteriamariabonita'}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a
                id="footerSocialWhatsapp"
                href={`https://wa.me/${BUSINESS_DATA.contact?.whatsappRaw || '529831226847'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="footer-col-title">Navegación</h4>
            <ul className="footer-links-list">
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="#especiales">Especialidades del Día</a></li>
              <li><a href="#catalogo">Menú Digital Completo</a></li>
              <li><a href="#nosotros">Nuestra Historia</a></li>
              <li><a href="#contacto">Ubicación y Horarios</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Categorías</h4>
            <ul className="footer-links-list">
              <li><a href="#catalogo">Huevos al Gusto</a></li>
              <li><a href="#catalogo">Hamburguesas & Sandwiches</a></li>
              <li><a href="#catalogo">Jugos Naturales</a></li>
              <li><a href="#catalogo">Café de Especialidad</a></li>
              <li><a href="#catalogo">Postres & Dulce Tradición</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Servicio al Cliente</h4>
            <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.75rem' }}>
              Lunes a Domingo desde las 7:00 am. Facturación disponible en caja y pedidos para eventos.
            </p>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <p style={{ fontSize: '0.75rem', color: 'var(--caramel-500)', fontWeight: 700, textTransform: 'uppercase' }}>
                Aviso de Menú
              </p>
              <p style={{ fontSize: '0.78rem', opacity: 0.75, marginTop: '0.2rem' }}>
                Precios en MXN con IVA incluido. Las fotografías son de carácter ilustrativo.
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © 2026 Cafetería María Bonita. Todos los derechos reservados. Desarrollado con pasión gastronómica.
            {' • '}
            <a
              href="/admin"
              style={{
                color: 'rgba(255, 255, 255, 0.4)',
                textDecoration: 'none',
                fontSize: '0.78rem',
                marginLeft: '0.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#f6c475')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)')}
              title="Acceso exclusivo para el dueño del restaurante"
            >
              🔒 Portal Dueño
            </a>
          </p>
          <a
            href="https://redaysoft.com"
            target="_blank"
            rel="noopener noreferrer"
            className="redaysoft-dev-badge"
            title="Visitar RedaySoft.com - Empresa Desarrolladora de Software y Menús Digitales"
            aria-label="Plataforma desarrollada por RedaySoft.com"
          >
            <img
              src="/assets/redaysoft-badge.png"
              alt="Plataforma desarrollada por RedaySoft.com"
              className="redaysoft-badge-img"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
