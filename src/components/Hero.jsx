'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import { useMenuData } from '../context/MenuDataContext';

export default function Hero() {
  const { setSelectedDish } = useCart();
  const { businessData: BUSINESS_DATA, products: MENU_ITEMS } = useMenuData();
  const heroData = BUSINESS_DATA.hero || {};

  // Find featured 3D dish from menuData
  const heroDish =
    MENU_ITEMS.find((item) => item.destacadoHero) ||
    MENU_ITEMS.find((item) => item.id === 'frio-1') ||
    MENU_ITEMS[0];

  const fallbackSrc = 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80';
  const kicker = heroDish?.heroKicker || '⭐ RECOMENDACIÓN DEL CHEF';
  const rating = heroDish?.heroRating || '4.9 de Excelencia';
  const subtitle = heroDish?.heroSubtitle || heroDish?.shortDescription;
  const priceFormatted = `$${Math.round(heroDish?.price || 84)}`;

  return (
    <section className="hero-section" id="inicio">
      <div className="container hero-grid">
        {/* Columna Izquierda: Texto y Llamado a la Acción */}
        <div className="hero-text-content">
          <div className="hero-badge-pill" id="heroBadgePill">
            <span className="icon" id="heroBadgeIcon">✨</span>
            <span id="heroBadgeText">{heroData.badgeText || 'Alta Cocina Matutina • Desayunos de Autor'}</span>
          </div>

          <h1 className="hero-title" id="heroTitle">
            {heroData.titleLine1 || 'Sabor de hogar,'} <br />
            {heroData.titleLine2Prefix || 'aroma a'}{' '}
            <span className="highlight">{heroData.titleHighlight || 'recién molido'}</span>.
          </h1>

          <p className="hero-subtitle" id="heroSubtitle">
            {heroData.subtitle ||
              'Chilaquiles mestizos con arrachera al carbón, panadería artesanal de masa madre horneada al alba y café de altura 100% mexicano para comenzar tu mañana de manera inolvidable.'}
          </p>

          <div className="hero-cta-group">
            <a href="#catalogo" className="btn-primary" id="heroBtnPrimary">
              <span>{heroData.primaryBtnText || 'Explorar Menú Completo'}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
            <a href="#especiales" className="btn-secondary" id="heroBtnSecondary">
              <span>{heroData.secondaryBtnText || 'Especialidades del Día'}</span>
            </a>
          </div>

          {/* Barra de Prestigio & Distinción */}
          <div className="hero-luxury-bar" id="heroLuxuryBar">
            <div className="luxury-bar-item">
              <span className="luxury-bar-icon">☕</span>
              <div className="luxury-bar-text">
                <strong>Café de Finca</strong>
                <span>Chiapas & Oaxaca</span>
              </div>
            </div>
            <div className="luxury-bar-divider"></div>
            <div className="luxury-bar-item">
              <span className="luxury-bar-icon">🥐</span>
              <div className="luxury-bar-text">
                <strong>Masa Madre</strong>
                <span>Fermentada 24 horas</span>
              </div>
            </div>
            <div className="luxury-bar-divider"></div>
            <div className="luxury-bar-item">
              <span className="luxury-bar-icon">🥚</span>
              <div className="luxury-bar-text">
                <strong>Libre Pastoreo</strong>
                <span>100% Orgánico</span>
              </div>
            </div>
            <div className="luxury-bar-divider"></div>
            <div className="luxury-bar-item">
              <span className="luxury-bar-icon">⭐</span>
              <div className="luxury-bar-text">
                <strong>4.9★ Calificación</strong>
                <span>+3,800 comensales</span>
              </div>
            </div>
          </div>
        </div>

        {/* Escenario 3D Flotante de Alta Gastronomía */}
        {heroDish && (
          <div
            className="hero-3d-scene"
            id="hero3DSceneContainer"
            role="button"
            tabIndex={0}
            onClick={() => setSelectedDish(heroDish)}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedDish(heroDish)}
            aria-label={`Ver y ordenar ${heroDish.name}`}
          >
            <div className="dish-3d-floating-container">
              {/* Wrapper concéntrico pegado al diámetro del plato para posicionar precio y rating */}
              <div className="dish-3d-plate-wrapper">
                {/* Anillo orbital dorado con resplandor */}
                <div className="dish-3d-ring"></div>

                {/* Plato Gourmet Circular 3D */}
                <div className="dish-3d-plate">
                  <img
                    src={heroDish.image}
                    alt={heroDish.name}
                    onError={(e) => {
                      e.currentTarget.src = fallbackSrc;
                    }}
                  />
                  <div className="dish-3d-sheen"></div>
                </div>

                {/* Sombra proyectada 3D */}
                <div className="dish-3d-drop-shadow"></div>

                {/* Chip 3D Flotante de Calificación */}
                <div className="badge-3d-rating">
                  <span className="star-icon">★</span>
                  <span>{rating}</span>
                </div>

                {/* Medallón 3D de Precio Metálico Dorado */}
                <div className="badge-3d-coin">
                  <span className="coin-tag">ESPECIAL</span>
                  <span className="coin-price">{priceFormatted}</span>
                  <span className="coin-currency">MXN</span>
                </div>
              </div>

              {/* Información Flotante SIN Recuadro */}
              <div className="dish-3d-meta-float">
                <span className="dish-3d-kicker">{kicker}</span>
                <h3 className="dish-3d-title">{heroDish.name}</h3>
                <p className="dish-3d-subtitle">{subtitle}</p>
                <div className="btn-3d-cta">
                  <span>Personalizar Platillo</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
