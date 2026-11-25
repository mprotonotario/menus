'use client';

import React from 'react';
import { useCart } from '../context/CartContext';
import { useMenuData } from '../context/MenuDataContext';

export default function Specials() {
  const { setSelectedDish, formatMoney } = useCart();
  const { products: MENU_ITEMS } = useMenuData();

  // Seleccionamos platillos insignia: cal-1, des-1, pan-1
  const specialIds = ['cal-1', 'des-1', 'pan-1'];
  const specials = specialIds
    .map((id) => MENU_ITEMS.find((item) => item.id === id))
    .filter(Boolean);

  const fallbackSrc = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80';

  return (
    <section className="specials-section" id="especiales">
      <div className="container">
        <div className="section-header">
          <span className="section-pretitle">Favoritos de la Casa</span>
          <h2 className="section-title">Especialidades del Día</h2>
          <p className="section-description">
            Platillos insignia y bebidas emblemáticas preparadas con el mimo y la tradición de la auténtica cocina
            mexicana.
          </p>
        </div>

        <div className="specials-grid" id="specialsContainer">
          {specials.map((item) => (
            <article key={item.id} className="special-card">
              <div className="special-card-img-wrap">
                <span className="special-badge-ribbon">{item.badge || 'Especial'}</span>
                <img
                  src={item.image}
                  alt={item.name}
                  className="special-card-img"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = fallbackSrc;
                  }}
                />
              </div>
              <div className="special-card-body">
                <h3 className="special-card-title">{item.name}</h3>
                <p className="special-card-desc">{item.shortDescription}</p>
                <div className="special-card-footer">
                  <div className="special-price-wrap">
                    <span className="special-price-label">Precio</span>
                    <span className="special-price">{formatMoney(item.price)}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-add-quick"
                    onClick={() => setSelectedDish(item)}
                    aria-label={`Ver y personalizar ${item.name}`}
                  >
                    <span>Ordenar</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
