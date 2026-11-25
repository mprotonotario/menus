'use client';

import React from 'react';
import { useMenuData } from '../context/MenuDataContext';

export default function AboutSection() {
  const { businessData: BUSINESS_DATA } = useMenuData();
  const stats = BUSINESS_DATA.stats || [];

  return (
    <section className="about-section" id="nosotros">
      <div className="container about-grid">
        <div className="about-img-gallery">
          <div className="about-img-card tall">
            <img
              src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=800&q=80"
              alt="Barista extrayendo espresso en María Bonita"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>
          <div className="about-img-card stacked">
            <div className="sub-img">
              <img
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
                alt="Panadería dulce artesanal"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80';
                }}
              />
            </div>
            <div className="sub-img">
              <img
                src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
                alt="Taza tradicional en barro"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80';
                }}
              />
            </div>
          </div>
        </div>

        <div className="about-content-wrap">
          <span className="section-pretitle">Tradición & Calidez</span>
          <h2 className="section-title">El rincón donde el café sabe a memoria y a hogar</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Nacimos con una convicción sencilla pero profunda: rendir homenaje a los campos cafetaleros de México y
            rescatar la calidez de las sobremesas familiares. Trabajamos de la mano con familias productoras de
            Coatepec, Huatusco y Pluma Hidalgo, garantizando un comercio justo y granos de altura excepcionales tostados
            en lotes pequeños.
          </p>
          <div className="about-quote">
            “No servimos únicamente café; compartimos el afecto de las recetas de casa en cada sorbo.”
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Cada mañana desde las 5:00 am, nuestro horno se enciende para hornear conchas de vainilla de Papantla,
            croissants hojaldrados y los panes brioche que acompañan tus desayunos.
          </p>

          {/* Métricas Destacadas */}
          <div className="about-stats-grid" id="statsGrid">
            {stats.map((st, idx) => (
              <div className="stat-card" key={idx}>
                <span className="stat-number">{st.number}</span>
                <span className="stat-label">{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
