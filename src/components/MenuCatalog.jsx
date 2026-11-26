'use client';

import React, { useState, useMemo } from 'react';
import DishCard from './DishCard';
import { useMenuData } from '../context/MenuDataContext';

export default function MenuCatalog() {
  const { categories: MENU_CATEGORIES, products: MENU_ITEMS, businessData } = useMenuData();
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [secondaryFilter, setSecondaryFilter] = useState('all');

  // Filter logic
  const filteredDishes = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      // 1. Categoría principal
      if (activeCategory !== 'todos' && item.category !== activeCategory) {
        return false;
      }
      // 2. Búsqueda por texto
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const inName = item.name?.toLowerCase().includes(q);
        const inShort = item.shortDescription?.toLowerCase().includes(q);
        const inDesc = item.description?.toLowerCase().includes(q);
        const inTags = item.tags?.some((t) => t.toLowerCase().includes(q));
        if (!inName && !inShort && !inDesc && !inTags) {
          return false;
        }
      }
      // 3. Filtros secundarios rápidos
      if (secondaryFilter !== 'all') {
        if (secondaryFilter === 'MasPedido') {
          return item.tags?.includes('Más Pedido') || item.badge?.toUpperCase() === 'FAVORITO';
        }
        if (secondaryFilter === 'Recomendado') {
          return item.tags?.includes('Recomendado') || item.tags?.includes('Insignia') || item.tags?.includes('Especial');
        }
        if (secondaryFilter === 'Vegetariano') {
          return item.tags?.includes('Vegetariano') || item.tags?.includes('Vegano') || item.tags?.includes('Sin Carne');
        }
        if (secondaryFilter === 'Dulce') {
          return item.tags?.includes('Dulce') || item.tags?.includes('Postre') || item.category === 'postres' || item.category === 'panaderia';
        }
      }
      return true;
    });
  }, [activeCategory, searchQuery, secondaryFilter, MENU_ITEMS]);

  // Group filtered dishes by category
  const groupedByCategory = useMemo(() => {
    const groups = {};
    filteredDishes.forEach((item) => {
      const catId = item.category || 'otros';
      if (!groups[catId]) {
        groups[catId] = [];
      }
      groups[catId].push(item);
    });
    return groups;
  }, [filteredDishes]);

  // Active category display name for result count
  const activeCategoryObj = MENU_CATEGORIES.find((c) => c.id === activeCategory);
  const activeCategoryName = activeCategoryObj ? activeCategoryObj.name : 'Todos los Platillos';

  const resetAllFilters = () => {
    setActiveCategory('todos');
    setSearchQuery('');
    setSecondaryFilter('all');
  };

  return (
    <section className="menu-catalog-section" id="catalogo">
      <div className="container">
        {/* Encabezado Editorial del Menú */}
        <div className="section-header menu-section-header">
          <span className="section-pretitle menu-pretitle">
            {businessData?.menuSection?.pretitle || '— NUESTRO MENÚ'}
          </span>
          <h2
            className="section-title menu-main-title"
            dangerouslySetInnerHTML={{
              __html: businessData?.menuSection?.titleHtml || 'Sabores para disfrutar <br /><em>en cada</em> momento.',
            }}
          />
          <p className="section-description menu-subtitle">
            {businessData?.menuSection?.description ||
              businessData?.menuSubtitle ||
              'Café, bebidas y alimentos preparados para acompañar cada visita a María Bonita.'}
          </p>
        </div>

        {/* Barra Sticky de Píldoras de Categorías */}
        <div className="category-filter-wrapper">
          <div className="container" style={{ padding: 0 }}>
            <div className="category-nav-scroll" role="tablist" aria-label="Categorías del Menú">
              {MENU_CATEGORIES.map((cat) => {
                const isActive = cat.id === activeCategory;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-pill-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                    role="tab"
                    aria-selected={isActive}
                  >
                    <span className="cat-icon">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Controles de Búsqueda y Filtros Secundarios */}
        <div className="menu-controls-row">
          <div className="search-input-box">
            <span className="search-icon-inside" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              id="menuSearchInput"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o ingrediente (ej. jamón, arrachera, nutella, cajeta)..."
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn visible"
                onClick={() => setSearchQuery('')}
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          <div className="secondary-filters-wrap">
            <button
              type="button"
              className={`secondary-filter-btn ${secondaryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSecondaryFilter('all')}
            >
              Todos los estilos
            </button>
            <button
              type="button"
              className={`secondary-filter-btn ${secondaryFilter === 'MasPedido' ? 'active' : ''}`}
              onClick={() => setSecondaryFilter('MasPedido')}
            >
              🔥 Más pedidos
            </button>
            <button
              type="button"
              className={`secondary-filter-btn ${secondaryFilter === 'Recomendado' ? 'active' : ''}`}
              onClick={() => setSecondaryFilter('Recomendado')}
            >
              ⭐ Recomendados
            </button>
            <button
              type="button"
              className={`secondary-filter-btn ${secondaryFilter === 'Vegetariano' ? 'active' : ''}`}
              onClick={() => setSecondaryFilter('Vegetariano')}
            >
              🌱 Vegetariano
            </button>
            <button
              type="button"
              className={`secondary-filter-btn ${secondaryFilter === 'Dulce' ? 'active' : ''}`}
              onClick={() => setSecondaryFilter('Dulce')}
            >
              🍰 Dulce
            </button>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="menu-results-count">
          {filteredDishes.length === 0
            ? 'No encontramos platillos que coincidan con tu búsqueda.'
            : `Mostrando ${filteredDishes.length} platillos en ${activeCategoryName}`}
        </div>

        {/* Contenedor de Subcategorías y Catálogo Agrupado */}
        <div className="menu-subcategories-container" id="dishesGridContainer">
          {filteredDishes.length === 0 ? (
            <div className="empty-search-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-search-icon">🔍</div>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--espresso-900)', marginBottom: '0.5rem' }}>
                No se encontraron resultados
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                Intenta con otro término o limpia los filtros para volver a ver todas nuestras delicias.
              </p>
              <button type="button" className="btn-secondary" onClick={resetAllFilters}>
                Ver todo el menú
              </button>
            </div>
          ) : (
            MENU_CATEGORIES.filter(
              (cat) => cat.id !== 'todos' && groupedByCategory[cat.id] && groupedByCategory[cat.id].length > 0
            ).map((cat) => {
              const items = groupedByCategory[cat.id];
              return (
                <section className="menu-subcategory-block" id={`subcat-${cat.id}`} key={cat.id}>
                  <div className="subcategory-header">
                    <div className="subcategory-title-wrap">
                      <span className="subcategory-badge">{cat.icon} Selección Artesanal</span>
                      <h3 className="subcategory-title">{cat.name}</h3>
                      {cat.description && <p className="subcategory-desc">{cat.description}</p>}
                    </div>
                    <div className="subcategory-divider-line"></div>
                  </div>
                  <div className="dishes-grid">
                    {items.map((item) => (
                      <DishCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
