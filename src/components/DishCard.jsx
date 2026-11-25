'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import { useMenuData } from '../context/MenuDataContext';

export default function DishCard({ item }) {
  const { setSelectedDish, formatMoney } = useCart();
  const { categories: MENU_CATEGORIES } = useMenuData();

  const isFavorite =
    item.badge?.toUpperCase() === 'FAVORITO' ||
    item.tags?.includes('Más Pedido') ||
    item.tags?.includes('Favorito') ||
    item.isFavorito;

  const favoriteBadgeText = isFavorite ? '★ FAVORITO' : item.badge ? `★ ${item.badge.toUpperCase()}` : null;

  const catObj = MENU_CATEGORIES.find((c) => c.id === item.category);
  let catLabel = '☕ Especialidad';
  if (catObj && catObj.id !== 'todos') {
    catLabel = `${catObj.icon} ${catObj.name}`;
  }

  const priceFormatted = item.price % 1 === 0 ? `$${item.price.toFixed(0)}` : formatMoney(item.price);
  const fallbackSrc = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80';

  return (
    <article
      className="dish-card"
      onClick={() => setSelectedDish(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setSelectedDish(item)}
      aria-label={`Ver opciones de ${item.name}`}
    >
      <div className="dish-img-container">
        {favoriteBadgeText && <span className="dish-badge-favorite">{favoriteBadgeText}</span>}
        <img
          src={item.image}
          alt={item.name}
          className="dish-img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = fallbackSrc;
          }}
        />
        <span className="dish-badge-category">{catLabel}</span>
      </div>

      <div className="dish-body">
        <h3 className="dish-title">{item.name}</h3>
        <p className="dish-desc">{item.shortDescription || item.description || ''}</p>

        <div className="dish-footer" onClick={(e) => e.stopPropagation()}>
          <div className="dish-price-box">
            <span className="dish-price">{priceFormatted}</span>
            {item.originalPrice && (
              <span className="dish-original-price">{formatMoney(item.originalPrice)}</span>
            )}
          </div>
          <button
            type="button"
            className="btn-dish-arrow"
            onClick={() => setSelectedDish(item)}
            aria-label={`Personalizar y ordenar ${item.name}`}
            title="Personalizar y ordenar"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
