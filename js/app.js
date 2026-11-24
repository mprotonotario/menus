/**
 * LÓGICA DE LA APLICACIÓN - CAFETERÍA MARÍA BONITA
 * Gestión de Menú Digital, Filtrado en Tiempo Real, Modal de Personalización
 * y Comanda con Generador de Pedidos a WhatsApp.
 */

(function () {
  'use strict';

  // --- ESTADO GLOBAL DE LA APLICACIÓN ---
  const state = {
    activeCategory: 'todos',
    searchQuery: '',
    secondaryFilter: 'all',
    cart: [],
    selectedDishForModal: null,
    modalQuantity: 1,
    modalSelectedSize: null,
    modalSelectedMilk: null,
    modalSelectedSalsa: null,
    modalSelectedExtras: [],
    serviceType: 'mesa', // 'mesa' o 'llevar'
    tableNumber: ''
  };

  // --- REFERENCIAS AL DOM ---
  const DOM = {
    // Header & Navegación
    siteHeader: document.getElementById('siteHeader'),
    openSearchBtn: document.getElementById('openSearchBtn'),
    openCartBtn: document.getElementById('openCartBtn'),
    cartCounter: document.getElementById('cartCounter'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileNavDrawer: document.getElementById('mobileNavDrawer'),
    closeMobileNavBtn: document.getElementById('closeMobileNavBtn'),
    hero3DSceneContainer: document.getElementById('hero3DSceneContainer'),
    
    // Controles de Menú
    categoriesContainer: document.getElementById('categoriesContainer'),
    menuSearchInput: document.getElementById('menuSearchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    secondaryFilters: document.getElementById('secondaryFilters'),
    resultsCount: document.getElementById('resultsCount'),
    dishesGridContainer: document.getElementById('dishesGridContainer'),
    specialsContainer: document.getElementById('specialsContainer'),

    // Métricas, Contacto y Negocio Dinámicos
    statsGrid: document.getElementById('statsGrid'),
    hoursTableBody: document.getElementById('hoursTableBody'),
    contactAddressTitle: document.getElementById('contactAddressTitle'),
    contactAddress: document.getElementById('contactAddress'),
    contactReference: document.getElementById('contactReference'),
    contactSectionTitle: document.getElementById('contactSectionTitle'),
    contactPhoneLink: document.getElementById('contactPhoneLink'),
    contactWhatsappNotice: document.getElementById('contactWhatsappNotice'),
    contactWhatsappBtn: document.getElementById('contactWhatsappBtn'),
    contactWhatsappBtnText: document.getElementById('contactWhatsappBtnText'),
    topNoticeHours: document.getElementById('topNoticeHours'),
    topNoticeLocation: document.getElementById('topNoticeLocation'),
    topNoticePhone: document.getElementById('topNoticePhone'),
    mapPinTitle: document.getElementById('mapPinTitle'),
    mapPinSubtitle: document.getElementById('mapPinSubtitle'),

    // Modal de Detalle
    dishModalOverlay: document.getElementById('dishModalOverlay'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    modalImg: document.getElementById('modalImg'),
    modalBadge: document.getElementById('modalBadge'),
    modalTagsRow: document.getElementById('modalTagsRow'),
    modalTitle: document.getElementById('modalTitle'),
    modalDesc: document.getElementById('modalDesc'),
    modalCalories: document.getElementById('modalCalories'),
    modalPrepTime: document.getElementById('modalPrepTime'),
    modalCustomOptionsContainer: document.getElementById('modalCustomOptionsContainer'),
    modalSpecialNotes: document.getElementById('modalSpecialNotes'),
    modalQtyMinus: document.getElementById('modalQtyMinus'),
    modalQtyPlus: document.getElementById('modalQtyPlus'),
    modalQtyVal: document.getElementById('modalQtyVal'),
    modalAddToCartBtn: document.getElementById('modalAddToCartBtn'),
    modalCurrentTotalPrice: document.getElementById('modalCurrentTotalPrice'),

    // Drawer de Comanda / Carrito
    cartDrawerOverlay: document.getElementById('cartDrawerOverlay'),
    closeCartBtn: document.getElementById('closeCartBtn'),
    cartDrawerBody: document.getElementById('cartDrawerBody'),
    cartDrawerFooter: document.getElementById('cartDrawerFooter'),
    btnServiceDineIn: document.getElementById('btnServiceDineIn'),
    btnServiceTakeaway: document.getElementById('btnServiceTakeaway'),
    tableNumberInput: document.getElementById('tableNumberInput'),
    cartSubtotal: document.getElementById('cartSubtotal'),
    cartTotal: document.getElementById('cartTotal'),
    sendOrderWhatsAppBtn: document.getElementById('sendOrderWhatsAppBtn'),
    clearCartBtn: document.getElementById('clearCartBtn'),

    // FAB Móvil
    fabOrderBtn: document.getElementById('fabOrderBtn'),
    fabCartCounter: document.getElementById('fabCartCounter'),
    fabCartTotal: document.getElementById('fabCartTotal'),

    // Toast
    toastNotification: document.getElementById('toastNotification'),
    toastMessage: document.getElementById('toastMessage')
  };

  // --- GENERADOR DE SVG FALLBACK PARA IMÁGENES ---
  // Garantiza que NUNCA exista un enlace roto, generando un SVG temático en caliente.
  function getSvgFallback(title, category) {
    const icon = category === 'calientes' ? '☕' :
                 category === 'frios' ? '🧊' :
                 category === 'desayunos' ? '🍳' :
                 category === 'comidas' ? '🍲' :
                 category === 'panaderia' ? '🥐' : '✨';

    const safeTitle = (title || 'María Bonita').substring(0, 24);
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3c2316;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1a0f08;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="600" height="400" fill="url(#grad)" />
        <circle cx="300" cy="170" r="70" fill="#c25428" opacity="0.35" />
        <text x="300" y="190" font-size="70" text-anchor="middle" dominant-baseline="middle">${icon}</text>
        <text x="300" y="275" font-family="'Playfair Display', serif" font-weight="bold" font-size="24" fill="#f8f3eb" text-anchor="middle">${safeTitle}</text>
        <text x="300" y="310" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" fill="#d97706" text-anchor="middle" letter-spacing="2">CAFETERÍA MARÍA BONITA</text>
      </svg>
    `.trim();

    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
  }

  // --- FORMATEADOR DE MONEDA MEXICANA (MXN) ---
  function formatMoney(amount) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(amount);
  }

  // --- CARGA Y PERSISTENCIA DE CARRITO (LOCALSTORAGE) ---
  function loadCartFromStorage() {
    try {
      const stored = localStorage.getItem('maria_bonita_cart');
      if (stored) {
        state.cart = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('No se pudo acceder al almacenamiento local', e);
      state.cart = [];
    }
    updateCartUI();
  }

  function saveCartToStorage() {
    try {
      localStorage.setItem('maria_bonita_cart', JSON.stringify(state.cart));
    } catch (e) {
      console.warn('Error al guardar en almacenamiento local', e);
    }
  }

  // --- NOTIFICACIÓN TOAST ---
  let toastTimeout;
  function showToast(message) {
    if (DOM.toastMessage) {
      DOM.toastMessage.textContent = message;
    }
    DOM.toastNotification.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      DOM.toastNotification.classList.remove('show');
    }, 2800);
  }

  // --- RENDERIZADO DE CATEGORÍAS ---
  function renderCategories() {
    if (!DOM.categoriesContainer) return;
    DOM.categoriesContainer.innerHTML = MENU_CATEGORIES.map(cat => {
      const isActive = cat.id === state.activeCategory ? 'active' : '';
      return `
        <button 
          type="button" 
          class="category-pill-btn ${isActive}" 
          data-category="${cat.id}"
          role="tab"
          aria-selected="${cat.id === state.activeCategory}"
        >
          <span class="cat-icon">${cat.icon}</span>
          <span>${cat.name}</span>
        </button>
      `;
    }).join('');

    // Eventos de clic en categorías
    DOM.categoriesContainer.querySelectorAll('.category-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.getAttribute('data-category');
        setCategory(catId);
      });
    });
  }

  function setCategory(catId) {
    state.activeCategory = catId;
    renderCategories();
    renderDishes();
  }

  // Exponer para enlaces del footer
  window.setCategoryAndScroll = function (catId) {
    setCategory(catId);
    const catalogElem = document.getElementById('catalogo');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- RENDERIZADO DINÁMICO DEL PLATILLO 3D EN EL HERO DESDE menuData.js ---
  function renderHero3DSpotlight() {
    if (!DOM.hero3DSceneContainer) return;

    // Buscar platillo con la bandera destacadoHero en menuData.js
    const dish = MENU_ITEMS.find(item => item.destacadoHero || item.heroDestacado || item.featuredInHero) || 
                 MENU_ITEMS.find(item => item.id === 'des-1') || 
                 MENU_ITEMS[0];
    if (!dish) return;

    const fallbackSrc = getSvgFallback(dish.name, dish.category);
    const kicker = dish.heroKicker || '⭐ Recomendación del Chef';
    const rating = dish.heroRating || '4.9 de Excelencia';
    const subtitle = dish.heroSubtitle || dish.shortDescription;
    const priceFormatted = `$${Math.round(dish.price)}`;

    DOM.hero3DSceneContainer.setAttribute('onclick', `window.openDishDetail('${dish.id}')`);
    DOM.hero3DSceneContainer.setAttribute('aria-label', `Ver y ordenar ${dish.name}`);

    DOM.hero3DSceneContainer.innerHTML = `
      <div class="dish-3d-floating-container">
        <!-- Wrapper concéntrico pegado al diámetro del plato para unir el precio y rating -->
        <div class="dish-3d-plate-wrapper">
          <!-- Anillo orbital dorado con resplandor -->
          <div class="dish-3d-ring"></div>

          <!-- Plato Gourmet Circular 3D -->
          <div class="dish-3d-plate">
            <img 
              src="${dish.image}" 
              alt="${dish.name}"
              onerror="this.onerror=null; this.src='${fallbackSrc}';"
            >
            <div class="dish-3d-sheen"></div>
          </div>

          <!-- Sombra proyectada 3D -->
          <div class="dish-3d-drop-shadow"></div>

          <!-- Chip 3D Flotante de Calificación (Pegado al borde del plato) -->
          <div class="badge-3d-rating">
            <span class="star-icon">★</span>
            <span>${rating}</span>
          </div>

          <!-- Medallón 3D de Precio Metálico Dorado (Pegado al borde del plato) -->
          <div class="badge-3d-coin">
            <span class="coin-tag">Especial</span>
            <span class="coin-price">${priceFormatted}</span>
            <span class="coin-currency">MXN</span>
          </div>
        </div>

        <!-- Información Flotante SIN Recuadro -->
        <div class="dish-3d-meta-float">
          <span class="dish-3d-kicker">${kicker}</span>
          <h3 class="dish-3d-title">${dish.name}</h3>
          <p class="dish-3d-subtitle">${subtitle}</p>
          <div class="btn-3d-cta">
            <span>Personalizar Platillo</span>
            <span style="font-size: 1.1rem; line-height: 1;">→</span>
          </div>
        </div>
      </div>
    `;
  }

  // --- RENDERIZADO DE ESPECIALIDADES DESTACADAS (TOP 3) ---
  function renderSpecials() {
    if (!DOM.specialsContainer) return;
    // Seleccionamos platillos insignia
    const specialIds = ['cal-1', 'des-1', 'pan-1'];
    const specials = MENU_ITEMS.filter(item => specialIds.includes(item.id));

    DOM.specialsContainer.innerHTML = specials.map(item => {
      const fallbackSrc = getSvgFallback(item.name, item.category);
      return `
        <article class="special-card">
          <div class="special-card-img-wrap">
            <span class="special-badge-ribbon">${item.badge || 'Especial'}</span>
            <img 
              src="${item.image}" 
              alt="${item.name}" 
              class="special-card-img"
              loading="lazy"
              onerror="this.onerror=null; this.src='${fallbackSrc}';"
            >
          </div>
          <div class="special-card-body">
            <h3 class="special-card-title">${item.name}</h3>
            <p class="special-card-desc">${item.shortDescription}</p>
            <div class="special-card-footer">
              <div class="special-price-wrap">
                <span class="special-price-label">Precio</span>
                <span class="special-price">${formatMoney(item.price)}</span>
              </div>
              <button 
                type="button" 
                class="btn-add-quick" 
                onclick="window.openDishDetail('${item.id}')"
                aria-label="Ver y personalizar ${item.name}"
              >
                <span>Personalizar</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // --- FILTRADO DE PLATILLOS ---
  function getFilteredDishes() {
    return MENU_ITEMS.filter(item => {
      // 1. Filtro por categoría principal
      if (state.activeCategory !== 'todos' && item.category !== state.activeCategory) {
        return false;
      }

      // 2. Filtro por búsqueda textual
      if (state.searchQuery.trim() !== '') {
        const query = state.searchQuery.toLowerCase().trim();
        const inName = item.name.toLowerCase().includes(query);
        const inDesc = item.shortDescription.toLowerCase().includes(query) || (item.description && item.description.toLowerCase().includes(query));
        const inTags = item.tags && item.tags.some(t => t.toLowerCase().includes(query));
        if (!inName && !inDesc && !inTags) {
          return false;
        }
      }

      // 3. Filtro secundario
      if (state.secondaryFilter !== 'all') {
        if (state.secondaryFilter === 'MasPedido') {
          return item.tags && item.tags.includes('Más Pedido');
        }
        if (state.secondaryFilter === 'Recomendado') {
          return item.tags && item.tags.includes('Recomendado');
        }
        if (state.secondaryFilter === 'Vegetariano') {
          return item.tags && item.tags.includes('Vegetariano');
        }
        if (state.secondaryFilter === 'Dulce') {
          return item.tags && item.tags.includes('Dulce');
        }
      }

      return true;
    });
  }

  // --- FUNCIÓN PARA RENDERIZAR UNA TARJETA INDIVIDUAL DE PLATILLO ---
  function renderSingleDishCard(item) {
    const fallbackSrc = getSvgFallback(item.name, item.category);
    const isFavorite = item.badge?.toUpperCase() === 'FAVORITO' || item.tags?.includes('Más Pedido') || item.tags?.includes('Favorito') || item.isFavorito;
    const favoriteBadgeHtml = isFavorite 
      ? `<span class="dish-badge-favorite">★ FAVORITO</span>` 
      : (item.badge ? `<span class="dish-badge-favorite">★ ${item.badge.toUpperCase()}</span>` : '');

    const catObj = MENU_CATEGORIES.find(c => c.id === item.category);
    let catLabel = '☕ Especialidad';
    if (catObj && catObj.id !== 'todos') {
      catLabel = `${catObj.icon} ${catObj.name}`;
    }
    const categoryBadgeHtml = `<span class="dish-badge-category">${catLabel}</span>`;

    const priceFormatted = item.price % 1 === 0 ? `$${item.price.toFixed(0)}` : formatMoney(item.price);
    const originalPriceHtml = item.originalPrice ? `<span class="dish-original-price">${formatMoney(item.originalPrice)}</span>` : '';

    return `
      <article class="dish-card" onclick="window.openDishDetail('${item.id}')" role="button" tabindex="0" aria-label="Ver detalle de ${item.name}">
        <div class="dish-img-container">
          ${favoriteBadgeHtml}
          <img 
            src="${item.image}" 
            alt="${item.name}" 
            class="dish-img"
            loading="lazy"
            onerror="this.onerror=null; this.src='${fallbackSrc}';"
          >
          ${categoryBadgeHtml}
        </div>
        <div class="dish-body">
          <h3 class="dish-title">${item.name}</h3>
          <p class="dish-desc">${item.shortDescription || item.description || ''}</p>
          <div class="dish-footer" onclick="event.stopPropagation()">
            <div class="dish-price-box">
              <span class="dish-price">${priceFormatted}</span>
              ${originalPriceHtml}
            </div>
            <button 
              type="button" 
              class="btn-dish-arrow" 
              onclick="window.openDishDetail('${item.id}')"
              aria-label="Ver opciones de ${item.name}"
              title="Personalizar y ordenar"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  // --- RENDERIZADO DEL CATÁLOGO DE PLATILLOS AGRUPADO POR CATEGORÍAS/SUBCATEGORÍAS ---
  function renderDishes() {
    if (!DOM.dishesGridContainer) return;
    const filtered = getFilteredDishes();

    // Actualizar conteo de resultados
    if (DOM.resultsCount) {
      if (filtered.length === 0) {
        DOM.resultsCount.textContent = 'No encontramos platillos que coincidan con tu búsqueda.';
      } else {
        const catName = MENU_CATEGORIES.find(c => c.id === state.activeCategory)?.name || 'Todos los Platillos';
        DOM.resultsCount.textContent = `Mostrando ${filtered.length} platillos en ${catName}`;
      }
    }

    if (filtered.length === 0) {
      DOM.dishesGridContainer.innerHTML = `
        <div class="empty-search-state" style="grid-column: 1 / -1;">
          <div class="empty-search-icon">🔍</div>
          <h3 style="font-size: 1.35rem; color: var(--espresso-900); margin-bottom: 0.5rem;">No se encontraron resultados</h3>
          <p style="color: var(--text-secondary); max-width: 440px; margin: 0 auto 1.5rem;">
            Intenta con otro término o limpia los filtros para volver a ver todas nuestras delicias.
          </p>
          <button type="button" class="btn-secondary" id="resetFiltersBtn">
            Ver todo el menú
          </button>
        </div>
      `;
      const resetBtn = document.getElementById('resetFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          state.activeCategory = 'todos';
          state.searchQuery = '';
          state.secondaryFilter = 'all';
          if (DOM.menuSearchInput) DOM.menuSearchInput.value = '';
          if (DOM.clearSearchBtn) DOM.clearSearchBtn.classList.remove('visible');
          document.querySelectorAll('.secondary-filter-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-filter') === 'all');
          });
          renderCategories();
          renderDishes();
        });
      }
      return;
    }

    // Agrupar los platillos filtrados por su categoría/subcategoría
    const groupedByCategory = {};
    filtered.forEach(item => {
      const catId = item.category || 'otros';
      if (!groupedByCategory[catId]) {
        groupedByCategory[catId] = [];
      }
      groupedByCategory[catId].push(item);
    });

    // Renderizar secciones de subcategorías con encabezados limpios y cuadrículas de 4 columnas
    const sectionsHtml = MENU_CATEGORIES
      .filter(cat => cat.id !== 'todos' && groupedByCategory[cat.id] && groupedByCategory[cat.id].length > 0)
      .map(cat => {
        const items = groupedByCategory[cat.id];
        const cardsHtml = items.map(item => renderSingleDishCard(item)).join('');
        return `
          <section class="menu-subcategory-block" id="subcat-${cat.id}">
            <div class="subcategory-header">
              <div class="subcategory-title-wrap">
                <span class="subcategory-badge">${cat.icon} Selección Artesanal</span>
                <h3 class="subcategory-title">${cat.name}</h3>
                ${cat.description ? `<p class="subcategory-desc">${cat.description}</p>` : ''}
              </div>
              <div class="subcategory-divider-line"></div>
            </div>
            <div class="dishes-grid">
              ${cardsHtml}
            </div>
          </section>
        `;
      }).join('');

    // Categorías adicionales si las hubiere
    const renderedCatIds = new Set(MENU_CATEGORIES.map(c => c.id));
    const extraCats = Object.keys(groupedByCategory).filter(cId => !renderedCatIds.has(cId));
    let extraSectionsHtml = '';
    if (extraCats.length > 0) {
      extraSectionsHtml = extraCats.map(catId => {
        const items = groupedByCategory[catId];
        const cardsHtml = items.map(item => renderSingleDishCard(item)).join('');
        return `
          <section class="menu-subcategory-block" id="subcat-${catId}">
            <div class="subcategory-header">
              <div class="subcategory-title-wrap">
                <span class="subcategory-badge">✨ Variedad</span>
                <h3 class="subcategory-title">${catId.charAt(0).toUpperCase() + catId.slice(1)}</h3>
              </div>
              <div class="subcategory-divider-line"></div>
            </div>
            <div class="dishes-grid">
              ${cardsHtml}
            </div>
          </section>
        `;
      }).join('');
    }

    DOM.dishesGridContainer.innerHTML = sectionsHtml + extraSectionsHtml;
  }

  // --- MODAL DE DETALLE Y PERSONALIZACIÓN DE PLATILLO ---
  window.openDishDetail = function (dishId) {
    const dish = MENU_ITEMS.find(d => d.id === dishId);
    if (!dish) return;

    state.selectedDishForModal = dish;
    state.modalQuantity = 1;
    state.modalSelectedExtras = [];
    state.modalSelectedSize = dish.options?.sizes ? dish.options.sizes[0] : null;
    state.modalSelectedMilk = dish.options?.milks ? dish.options.milks[0] : null;
    state.modalSelectedSalsa = dish.options?.salsas ? dish.options.salsas[0] : null;

    // Llenar contenido modal
    DOM.modalTitle.textContent = dish.name;
    DOM.modalDesc.textContent = dish.description || dish.shortDescription;
    DOM.modalImg.src = dish.image;
    DOM.modalImg.onerror = function () {
      this.onerror = null;
      this.src = getSvgFallback(dish.name, dish.category);
    };

    if (dish.badge) {
      DOM.modalBadge.style.display = 'inline-block';
      DOM.modalBadge.textContent = dish.badge;
    } else {
      DOM.modalBadge.style.display = 'none';
    }

    DOM.modalCalories.textContent = `🔥 ${dish.calories || '250 kcal'}`;
    DOM.modalPrepTime.textContent = `⏱️ Preparación: ${dish.prepTime || '5 min'}`;

    if (DOM.modalTagsRow) {
      DOM.modalTagsRow.innerHTML = (dish.tags || []).map(t => `<span class="dish-tag">${t}</span>`).join('');
    }

    if (DOM.modalSpecialNotes) {
      DOM.modalSpecialNotes.value = '';
    }

    // Renderizar Opciones Específicas
    renderModalCustomOptions(dish);
    updateModalPriceCalculation();

    // Abrir modal
    DOM.dishModalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  function closeModal() {
    DOM.dishModalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    state.selectedDishForModal = null;
  }

  function renderModalCustomOptions(dish) {
    if (!DOM.modalCustomOptionsContainer) return;
    DOM.modalCustomOptionsContainer.innerHTML = '';

    if (!dish.options) {
      DOM.modalCustomOptionsContainer.innerHTML = `
        <div style="font-size: 0.85rem; color: var(--text-muted); padding: 0.75rem 0;">
          Este platillo se prepara fresco y al momento con la receta tradicional de la casa.
        </div>
      `;
      return;
    }

    let html = '';

    // 1. Tamaños / Porciones
    if (dish.options.sizes && dish.options.sizes.length > 0) {
      html += `
        <div class="custom-section-block">
          <div class="custom-section-title">
            <span>Selecciona Tamaño / Presentación:</span>
            <span class="req-badge">Requerido</span>
          </div>
          <div class="custom-options-grid">
            ${dish.options.sizes.map((s, idx) => `
              <label class="custom-option-label">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <input type="radio" name="modal_size" value="${idx}" ${idx === 0 ? 'checked' : ''} onchange="window.updateModalSizeSelection(${idx})">
                  <span>${s.label}</span>
                </div>
                <strong>${s.extraPrice > 0 ? `+ ${formatMoney(s.extraPrice)}` : 'Incluido'}</strong>
              </label>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 2. Tipo de Leche (para bebidas)
    if (dish.options.milks && dish.options.milks.length > 0) {
      html += `
        <div class="custom-section-block">
          <div class="custom-section-title">
            <span>Tipo de Leche / Base:</span>
            <span class="req-badge">1 opción</span>
          </div>
          <div class="custom-options-grid">
            ${dish.options.milks.map((m, idx) => `
              <label class="custom-option-label">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <input type="radio" name="modal_milk" value="${m}" ${idx === 0 ? 'checked' : ''} onchange="window.updateModalMilkSelection('${m}')">
                  <span>${m}</span>
                </div>
              </label>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 3. Salsas (para chilaquiles o desayunos)
    if (dish.options.salsas && dish.options.salsas.length > 0) {
      html += `
        <div class="custom-section-block">
          <div class="custom-section-title">
            <span>Salsa de la casa:</span>
            <span class="req-badge">Requerido</span>
          </div>
          <div class="custom-options-grid">
            ${dish.options.salsas.map((s, idx) => `
              <label class="custom-option-label">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <input type="radio" name="modal_salsa" value="${s}" ${idx === 0 ? 'checked' : ''} onchange="window.updateModalSalsaSelection('${s}')">
                  <span>${s}</span>
                </div>
              </label>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 4. Extras / Ingredientes Adicionales
    if (dish.options.extras && dish.options.extras.length > 0) {
      html += `
        <div class="custom-section-block">
          <div class="custom-section-title">
            <span>Ingredientes Extras & Adicionales:</span>
            <span class="req-badge">Opcional</span>
          </div>
          <div class="custom-options-grid">
            ${dish.options.extras.map((extra, idx) => `
              <label class="custom-option-label">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <input type="checkbox" name="modal_extra" value="${idx}" onchange="window.toggleModalExtra(${idx}, this.checked)">
                  <span>${extra.name}</span>
                </div>
                <strong style="color: var(--terracotta-600);">+ ${formatMoney(extra.price)}</strong>
              </label>
            `).join('')}
          </div>
        </div>
      `;
    }

    DOM.modalCustomOptionsContainer.innerHTML = html;
  }

  // Handlers para las opciones del modal
  window.updateModalSizeSelection = function (index) {
    if (state.selectedDishForModal?.options?.sizes) {
      state.modalSelectedSize = state.selectedDishForModal.options.sizes[index];
      updateModalPriceCalculation();
    }
  };

  window.updateModalMilkSelection = function (milkName) {
    state.modalSelectedMilk = milkName;
    updateModalPriceCalculation();
  };

  window.updateModalSalsaSelection = function (salsaName) {
    state.modalSelectedSalsa = salsaName;
  };

  window.toggleModalExtra = function (extraIndex, isChecked) {
    const extra = state.selectedDishForModal?.options?.extras[extraIndex];
    if (!extra) return;

    if (isChecked) {
      state.modalSelectedExtras.push(extra);
    } else {
      state.modalSelectedExtras = state.modalSelectedExtras.filter(e => e.name !== extra.name);
    }
    updateModalPriceCalculation();
  };

  function updateModalPriceCalculation() {
    if (!state.selectedDishForModal) return;

    let unitPrice = state.selectedDishForModal.price;

    // Sumar extra por tamaño
    if (state.modalSelectedSize && state.modalSelectedSize.extraPrice) {
      unitPrice += state.modalSelectedSize.extraPrice;
    }

    // Sumar extras seleccionados
    state.modalSelectedExtras.forEach(e => {
      unitPrice += e.price;
    });

    const totalPrice = unitPrice * state.modalQuantity;

    if (DOM.modalQtyVal) DOM.modalQtyVal.textContent = state.modalQuantity;
    if (DOM.modalCurrentTotalPrice) DOM.modalCurrentTotalPrice.textContent = formatMoney(totalPrice);
  }

  // Modificar cantidad en modal
  if (DOM.modalQtyMinus) {
    DOM.modalQtyMinus.addEventListener('click', () => {
      if (state.modalQuantity > 1) {
        state.modalQuantity--;
        updateModalPriceCalculation();
      }
    });
  }

  if (DOM.modalQtyPlus) {
    DOM.modalQtyPlus.addEventListener('click', () => {
      state.modalQuantity++;
      updateModalPriceCalculation();
    });
  }

  // Botón Agregar al Carrito desde el Modal
  if (DOM.modalAddToCartBtn) {
    DOM.modalAddToCartBtn.addEventListener('click', () => {
      if (!state.selectedDishForModal) return;

      const dish = state.selectedDishForModal;
      let unitPrice = dish.price;

      if (state.modalSelectedSize && state.modalSelectedSize.extraPrice) {
        unitPrice += state.modalSelectedSize.extraPrice;
      }

      state.modalSelectedExtras.forEach(e => {
        unitPrice += e.price;
      });

      // Construir resumen de personalizaciones
      const customizations = [];
      if (state.modalSelectedSize) customizations.push(state.modalSelectedSize.label);
      if (state.modalSelectedMilk) customizations.push(`Leche: ${state.modalSelectedMilk}`);
      if (state.modalSelectedSalsa) customizations.push(`Salsa: ${state.modalSelectedSalsa}`);
      if (state.modalSelectedExtras.length > 0) {
        customizations.push(`Extras: ${state.modalSelectedExtras.map(e => e.name).join(', ')}`);
      }

      const notes = DOM.modalSpecialNotes ? DOM.modalSpecialNotes.value.trim() : '';

      addItemToCart({
        id: dish.id,
        name: dish.name,
        category: dish.category,
        image: dish.image,
        unitPrice: unitPrice,
        quantity: state.modalQuantity,
        customizations: customizations.join(' • '),
        notes: notes
      });

      closeModal();
      showToast(`¡"${dish.name}" agregado a tu pedido!`);
      triggerCartBounce();
    });
  }

  // Agregar rápido desde la tarjeta (botón +)
  window.quickAddToCart = function (dishId, event) {
    if (event) event.stopPropagation();
    const dish = MENU_ITEMS.find(d => d.id === dishId);
    if (!dish) return;

    addItemToCart({
      id: dish.id,
      name: dish.name,
      category: dish.category,
      image: dish.image,
      unitPrice: dish.price,
      quantity: 1,
      customizations: 'Preparación clásica',
      notes: ''
    });

    showToast(`¡"${dish.name}" agregado a tu pedido!`);
    triggerCartBounce();
  };

  function triggerCartBounce() {
    if (DOM.cartCounter) {
      DOM.cartCounter.classList.add('bump');
      setTimeout(() => DOM.cartCounter.classList.remove('bump'), 300);
    }
  }

  // --- GESTIÓN DEL CARRITO / COMANDA ---
  function addItemToCart(item) {
    // Si ya existe con las mismas personalizaciones y notas, solo suma cantidad
    const existingIndex = state.cart.findIndex(c => 
      c.id === item.id && 
      c.customizations === item.customizations && 
      c.notes === item.notes
    );

    if (existingIndex > -1) {
      state.cart[existingIndex].quantity += item.quantity;
    } else {
      state.cart.push(item);
    }

    saveCartToStorage();
    updateCartUI();
  }

  window.changeCartQty = function (index, delta) {
    if (!state.cart[index]) return;
    state.cart[index].quantity += delta;
    if (state.cart[index].quantity <= 0) {
      state.cart.splice(index, 1);
    }
    saveCartToStorage();
    updateCartUI();
  };

  window.removeCartItem = function (index) {
    if (!state.cart[index]) return;
    state.cart.splice(index, 1);
    saveCartToStorage();
    updateCartUI();
  };

  function updateCartUI() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    // Actualizar contadores del header y FAB
    if (DOM.cartCounter) DOM.cartCounter.textContent = totalItems;
    if (DOM.fabCartCounter) DOM.fabCartCounter.textContent = totalItems;
    if (DOM.fabCartTotal) DOM.fabCartTotal.textContent = formatMoney(subtotal);
    if (DOM.cartSubtotal) DOM.cartSubtotal.textContent = formatMoney(subtotal);
    if (DOM.cartTotal) DOM.cartTotal.textContent = `${formatMoney(subtotal)} MXN`;

    // Renderizar cuerpo del drawer
    if (!DOM.cartDrawerBody) return;

    if (state.cart.length === 0) {
      DOM.cartDrawerBody.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">☕</div>
          <h4 style="font-size: 1.15rem; color: var(--espresso-900);">Tu comanda está vacía</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
            Explora nuestro menú y selecciona tus bebidas o platillos favoritos para enviar tu pedido directo a cocina.
          </p>
          <button type="button" class="btn-primary" style="margin-top: 1rem; padding: 0.6rem 1.4rem; font-size: 0.85rem;" onclick="document.getElementById('closeCartBtn').click();">
            Ver el menú
          </button>
        </div>
      `;
      if (DOM.cartDrawerFooter) DOM.cartDrawerFooter.style.display = 'none';
      return;
    }

    if (DOM.cartDrawerFooter) DOM.cartDrawerFooter.style.display = 'block';

    DOM.cartDrawerBody.innerHTML = `
      <div class="cart-items-list">
        ${state.cart.map((item, idx) => {
          const fallbackSrc = getSvgFallback(item.name, item.category);
          return `
            <div class="cart-item-card">
              <img 
                src="${item.image}" 
                alt="${item.name}" 
                class="cart-item-img"
                onerror="this.onerror=null; this.src='${fallbackSrc}';"
              >
              <div class="cart-item-info">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <h4 class="cart-item-title">${item.name}</h4>
                  <button type="button" class="cart-item-remove-btn" onclick="window.removeCartItem(${idx})" aria-label="Eliminar ${item.name}">✕</button>
                </div>
                ${item.customizations ? `<span class="cart-item-custom-notes">${item.customizations}</span>` : ''}
                ${item.notes ? `<span class="cart-item-custom-notes" style="color: var(--terracotta-600); font-style: italic;">“${item.notes}”</span>` : ''}
                
                <div class="cart-item-row-action">
                  <span class="cart-item-price">${formatMoney(item.unitPrice * item.quantity)}</span>
                  <div class="cart-mini-stepper">
                    <button type="button" onclick="window.changeCartQty(${idx}, -1)" aria-label="Restar">-</button>
                    <span>${item.quantity}</span>
                    <button type="button" onclick="window.changeCartQty(${idx}, 1)" aria-label="Sumar">+</button>
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // --- GENERADOR DE COMANDA PARA WHATSAPP ---
  function sendOrderViaWhatsApp() {
    if (state.cart.length === 0) {
      alert('Tu comanda está vacía. Agrega platillos antes de enviar tu pedido.');
      return;
    }

    const serviceName = state.serviceType === 'mesa' ? 'Consumo en Mesa' : 'Para Llevar / Pick-up';
    const reference = DOM.tableNumberInput ? DOM.tableNumberInput.value.trim() : '';

    let message = `*☕ PEDIDO - CAFETERÍA MARÍA BONITA*\n`;
    message += `──────────────────────\n`;
    message += `📍 *Tipo de Servicio:* ${serviceName}\n`;
    if (reference) {
      message += `🏷️ *Referencia / Mesa:* ${reference}\n`;
    }
    message += `🕒 *Fecha:* ${new Date().toLocaleDateString('es-MX')} ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}\n`;
    message += `──────────────────────\n\n`;
    message += `*DETALLE DE LA COMANDA:*\n`;

    let total = 0;
    state.cart.forEach((item, index) => {
      const itemSubtotal = item.unitPrice * item.quantity;
      total += itemSubtotal;
      message += `*${item.quantity}x* ${item.name} (${formatMoney(itemSubtotal)})\n`;
      if (item.customizations) {
        message += `   ↳ _${item.customizations}_\n`;
      }
      if (item.notes) {
        message += `   ↳ 📝 _Nota: ${item.notes}_\n`;
      }
      message += `\n`;
    });

    message += `──────────────────────\n`;
    message += `*TOTAL A PAGAR:* ${formatMoney(total)} MXN\n\n`;
    message += `_Por favor confírmenme el tiempo estimado de preparación. ¡Muchas gracias!_`;

    const encodedText = encodeURIComponent(message);
    const waNumber = (typeof BUSINESS_DATA !== 'undefined' && BUSINESS_DATA.contact && BUSINESS_DATA.contact.whatsappNumber)
      || (typeof CAFE_INFO !== 'undefined' && CAFE_INFO.whatsapp)
      || '525552089432';
    const whatsappUrl = `https://wa.me/${waNumber}?text=${encodedText}`;

    window.open(whatsappUrl, '_blank');
  }

  // --- HELPERS PARA CÁLCULO DINÁMICO DE ESTADO (ABIERTO / CERRADO) ---
  function parseTimeToMinutes(timeStr) {
    if (!timeStr) return null;
    const clean = timeStr.trim().toLowerCase();
    
    // Formato 24h: "22:00", "06:30"
    const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      return parseInt(match24[1], 10) * 60 + parseInt(match24[2], 10);
    }

    // Formato 12h: "07:00 am", "10:00 pm", "7:30pm"
    const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
    if (match12) {
      let hours = parseInt(match12[1], 10);
      const minutes = parseInt(match12[2], 10);
      const meridiem = match12[3];
      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }

    return null;
  }

  function isScheduleForDay(scheduleItem, dayOfWeek) {
    if (Array.isArray(scheduleItem.dayIndices) && scheduleItem.dayIndices.length > 0) {
      return scheduleItem.dayIndices.includes(dayOfWeek);
    }
    const daysStr = (scheduleItem.days || '').toLowerCase();
    const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'miercoles', 'jueves', 'viernes', 'sábado', 'sabado'];
    const currentDayName = dayNames[dayOfWeek];

    if (daysStr.includes('todos') || daysStr.includes('diario')) return true;
    if (daysStr.includes('fin de semana') && (dayOfWeek === 0 || dayOfWeek === 6)) return true;
    if (daysStr.includes('lunes a jueves') && dayOfWeek >= 1 && dayOfWeek <= 4) return true;
    if (daysStr.includes('lunes a viernes') && dayOfWeek >= 1 && dayOfWeek <= 5) return true;
    if ((daysStr.includes('lunes a sábado') || daysStr.includes('lunes a sabado')) && dayOfWeek >= 1 && dayOfWeek <= 6) return true;
    if (daysStr.includes('viernes') && dayOfWeek === 5) return true;
    if ((daysStr.includes('sábado') || daysStr.includes('sabado') || daysStr.includes('sábados')) && dayOfWeek === 6) return true;
    if ((daysStr.includes('domingo') || daysStr.includes('domingos')) && dayOfWeek === 0) return true;

    return daysStr.includes(currentDayName);
  }

  function getOpenCloseMinutes(scheduleItem) {
    let openMin = null;
    let closeMin = null;

    if (scheduleItem.open) openMin = parseTimeToMinutes(scheduleItem.open);
    if (scheduleItem.close) closeMin = parseTimeToMinutes(scheduleItem.close);

    if (openMin === null || closeMin === null) {
      const timeStr = scheduleItem.time || '';
      const parts = timeStr.split(/\s*[-–]\s*|\s+a\s+/i);
      if (parts.length >= 2) {
        if (openMin === null) openMin = parseTimeToMinutes(parts[0]);
        if (closeMin === null) closeMin = parseTimeToMinutes(parts[1]);
      }
    }

    return { openMin, closeMin };
  }

  function computeLiveBusinessStatus(businessData, now = new Date()) {
    const config = businessData.scheduleStatus || {};
    const mode = (config.mode || 'auto').toLowerCase();

    // 1. Modo Forzado Manual si se requiere en configuración
    if (mode === 'open') {
      return {
        isOpen: true,
        todayItem: null,
        badgeText: 'Abierto Ahora',
        pinText: 'Abierto ahora',
        cssClass: 'is-open'
      };
    }
    if (mode === 'closed') {
      return {
        isOpen: false,
        todayItem: null,
        badgeText: 'Cerrado Ahora',
        pinText: 'Cerrado ahora',
        cssClass: 'is-closed'
      };
    }

    // 2. Modo Automático basado en reloj y horario de hoy
    const dayOfWeek = now.getDay();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const hours = businessData.hours || [];

    const todaySchedule = hours.find(h => isScheduleForDay(h, dayOfWeek));

    if (!todaySchedule) {
      return {
        isOpen: false,
        todayItem: null,
        badgeText: 'Cerrado Hoy',
        pinText: 'Cerrado hoy',
        cssClass: 'is-closed'
      };
    }

    const { openMin, closeMin } = getOpenCloseMinutes(todaySchedule);

    if (openMin === null || closeMin === null) {
      return {
        isOpen: true,
        todayItem: todaySchedule,
        badgeText: `Abierto Hoy: ${todaySchedule.time}`,
        pinText: 'Abierto ahora',
        cssClass: 'is-open'
      };
    }

    let isOpen = false;
    if (closeMin > openMin) {
      isOpen = currentMin >= openMin && currentMin < closeMin;
    } else {
      // Soporte para horarios de madrugada (ej. cierra a las 2:00 am)
      isOpen = currentMin >= openMin || currentMin < closeMin;
    }

    let badgeText = '';
    const openPrefix = config.openBadgePrefix || 'Abierto Hoy:';
    const closedPrefix = config.closedBadgePrefix || 'Cerrado Ahora';

    if (isOpen) {
      badgeText = `${openPrefix} ${todaySchedule.time}`;
    } else {
      if (currentMin < openMin) {
        const openTimePart = todaySchedule.time.split(/\s*[-–]\s*|\s+a\s+/i)[0].trim();
        badgeText = `${closedPrefix} • Abre hoy a las ${openTimePart}`;
      } else {
        badgeText = `${closedPrefix} • Horario hoy: ${todaySchedule.time}`;
      }
    }

    return {
      isOpen,
      todayItem: todaySchedule,
      badgeText,
      pinText: isOpen ? 'Abierto ahora' : 'Cerrado ahora',
      cssClass: isOpen ? 'is-open' : 'is-closed'
    };
  }

  // --- RENDERIZADO DE INFORMACIÓN GENERAL, HORARIOS Y STATS ---
  function renderCafeMeta() {
    const data = (typeof BUSINESS_DATA !== 'undefined' ? BUSINESS_DATA : null) || (typeof CAFE_INFO !== 'undefined' ? CAFE_INFO : null);
    if (!data) return;

    // 0. Identidad de Marca (Header, Drawer móvil y Footer)
    const brand = data.brand || {};
    const brandTitle = brand.title || data.name || 'María Bonita';
    const brandSubtitle = brand.subtitle || data.tradeName || 'Cafetería & Panadería';
    document.querySelectorAll('.brand-title').forEach(el => {
      el.textContent = brandTitle;
    });
    document.querySelectorAll('.brand-subtitle').forEach(el => {
      if (el.closest('.site-footer') && (brand.footerSubtitle || data.slogan)) {
        el.textContent = brand.footerSubtitle || 'Sabor de hogar';
      } else {
        el.textContent = brandSubtitle;
      }
    });

    // 1. Hero Principal (Badge, Titular, Subtítulo y Botones)
    const hero = data.hero || {};

    // Hero Badge
    const heroBadgeText = document.getElementById('heroBadgeText');
    const heroBadgeIcon = document.getElementById('heroBadgeIcon');
    if (heroBadgeText) {
      heroBadgeText.textContent = hero.badgeText || 'Alta Cocina Matutina • Desayunos de Autor';
    }
    if (heroBadgeIcon && hero.badgeIcon) {
      heroBadgeIcon.textContent = hero.badgeIcon;
    }

    // Hero Titular (Soporta titleHtml enriquecido o title / slogan directo)
    const heroTitle = document.getElementById('heroTitle');
    if (heroTitle) {
      if (hero.titleHtml) {
        heroTitle.innerHTML = hero.titleHtml;
      } else if (hero.title) {
        heroTitle.textContent = hero.title;
      } else if (data.slogan) {
        heroTitle.textContent = data.slogan;
      }
    }

    // Hero Subtítulo
    const heroSubtitle = document.getElementById('heroSubtitle');
    if (heroSubtitle) {
      heroSubtitle.textContent = hero.subtitle || data.subheadline || heroSubtitle.textContent;
    }

    // Hero Botones de Acción
    const heroBtnPrimary = document.getElementById('heroBtnPrimary');
    if (heroBtnPrimary && hero.btnPrimaryText) {
      const span = heroBtnPrimary.querySelector('span');
      if (span) span.textContent = hero.btnPrimaryText;
    }
    const heroBtnSecondary = document.getElementById('heroBtnSecondary');
    if (heroBtnSecondary && hero.btnSecondaryText) {
      const span = heroBtnSecondary.querySelector('span');
      if (span) span.textContent = hero.btnSecondaryText;
    }

    // Hero Barra de Distinción / Prestigio
    const heroLuxuryBar = document.getElementById('heroLuxuryBar');
    if (heroLuxuryBar && Array.isArray(hero.luxuryPills) && hero.luxuryPills.length > 0) {
      heroLuxuryBar.innerHTML = hero.luxuryPills.map((p, idx) => `
        <div class="luxury-bar-item">
          <span class="luxury-bar-icon">${p.icon}</span>
          <div class="luxury-bar-text">
            <strong>${p.title}</strong>
            <span>${p.subtitle}</span>
          </div>
        </div>
        ${idx < hero.luxuryPills.length - 1 ? '<div class="luxury-bar-divider"></div>' : ''}
      `).join('');
    }

    // 2. Cálculo Dinámico de Estado (Abierto / Cerrado) en Tiempo Real
    const liveStatus = computeLiveBusinessStatus(data);

    // Barra Superior de Avisos (Top Notice Bar)
    const topBadge = document.getElementById('topNoticeStatusBadge');
    if (topBadge) {
      topBadge.classList.remove('is-open', 'is-closed');
      topBadge.classList.add(liveStatus.cssClass);
    }
    if (DOM.topNoticeHours) {
      DOM.topNoticeHours.textContent = liveStatus.badgeText;
    }

    // 3. Horarios de Servicio Dinámicos en la Tabla (Destaca el día de hoy)
    const hoursList = data.hours || [];
    if (DOM.hoursTableBody && hoursList.length > 0) {
      const currentDayOfWeek = new Date().getDay();
      DOM.hoursTableBody.innerHTML = hoursList.map(h => {
        const isToday = isScheduleForDay(h, currentDayOfWeek);
        return `
          <tr class="${isToday ? 'is-today' : ''}">
            <td class="day">${h.days}</td>
            <td class="time">${h.time}</td>
          </tr>
        `;
      }).join('');
    }

    // Drawer Móvil de Navegación
    const mobileSchedule = document.getElementById('mobileNavScheduleStatus');
    if (mobileSchedule) {
      const statusWord = liveStatus.isOpen ? '<span style="color:#22c55e;font-weight:700;">Abierto</span>' : '<span style="color:#ef4444;font-weight:700;">Cerrado</span>';
      const todayHoursStr = liveStatus.todayItem ? liveStatus.todayItem.time : 'Cerrado';
      mobileSchedule.innerHTML = `<strong>Horario de hoy:</strong> ${todayHoursStr} (${statusWord})`;
    }

    // 4. Sección Editorial de Ubicación y Contacto (Diseño Inspirado en María Bonita)
    const loc = data.location || {};

    const locationPretitle = document.getElementById('locationPretitle');
    if (locationPretitle) {
      locationPretitle.textContent = loc.sectionPretitle || '— NUESTRA UBICACIÓN';
    }

    const locationHeading = document.getElementById('locationHeading');
    if (locationHeading) {
      if (loc.headingHtml) {
        locationHeading.innerHTML = loc.headingHtml;
      } else {
        const l1 = loc.headingLine1 || 'Ven a disfrutar';
        const l2 = loc.headingLine2 || 'un momento bonito.';
        locationHeading.innerHTML = `${l1}<br><em>${l2}</em>`;
      }
    }

    const locationLead = document.getElementById('locationLead');
    if (locationLead) {
      locationLead.textContent = loc.leadText || 'María Bonita te espera en el Centro de Chetumal, Quintana Roo.';
    }

    const locationDesc = document.getElementById('locationDesc');
    if (locationDesc) {
      locationDesc.textContent = loc.descText || 'Visítanos, conoce nuestro espacio, descubre nuestros rincones y disfruta una taza de café en un ambiente cálido y lleno de encanto.';
    }

    // Dirección
    const contactAddressTitle = document.getElementById('contactAddressTitle');
    if (contactAddressTitle && loc.addressTitle) {
      contactAddressTitle.textContent = loc.addressTitle;
    }
    const locationAddressLine1 = document.getElementById('locationAddressLine1');
    if (locationAddressLine1) {
      locationAddressLine1.textContent = loc.addressLine1 || loc.address || 'Av. Álvaro Obregón #168, Col. Centro';
    }
    const locationAddressLine2 = document.getElementById('locationAddressLine2');
    if (locationAddressLine2) {
      locationAddressLine2.textContent = loc.addressLine2 || loc.cityZone || '77000 Chetumal, Quintana Roo';
    }

    // Horarios en formato fila editorial
    const contactHoursTitle = document.getElementById('contactHoursTitle');
    if (contactHoursTitle && loc.hoursTitle) {
      contactHoursTitle.textContent = loc.hoursTitle;
    }
    const locationHoursRows = document.getElementById('locationHoursRows');
    if (locationHoursRows && hoursList.length > 0) {
      const currentDay = new Date().getDay();
      locationHoursRows.innerHTML = hoursList.map(h => {
        const isToday = isScheduleForDay(h, currentDay);
        return `<div class="location-hour-row ${isToday ? 'is-today' : ''}"><span>${h.days}:</span> <strong>${h.time}</strong></div>`;
      }).join('');
    }

    // Pedidos y Contacto
    const contact = data.contact || {};
    const phoneDisplay = contact.phoneDisplay || data.phone || '+52 983 122 6847';
    const phoneCall = contact.phoneCall || (contact.phoneDisplay ? contact.phoneDisplay.replace(/[^\d+]/g, '') : '+529831226847');
    const waNumber = contact.whatsappNumber || data.whatsapp || '529831226847';
    const waNotice = loc.contactPrompt || contact.whatsappMessageNotice || 'Escríbenos por WhatsApp para realizar tu pedido.';
    const waDefaultMsg = contact.whatsappDefaultMessage || 'Hola Cafetería María Bonita, quisiera consultar sobre disponibilidad y pedidos...';

    const contactSectionTitle = document.getElementById('contactSectionTitle');
    if (contactSectionTitle) {
      contactSectionTitle.textContent = loc.contactTitle || contact.title || 'Pedidos y contacto';
    }
    const locationContactPrompt = document.getElementById('locationContactPrompt');
    if (locationContactPrompt) {
      locationContactPrompt.textContent = waNotice;
    }

    // Botones de Acción
    const locationDirectionsBtn = document.getElementById('locationDirectionsBtn');
    if (locationDirectionsBtn) {
      const destQuery = encodeURIComponent(loc.fullPostalAddress || loc.address || 'Av. Álvaro Obregón 168, Chetumal, Quintana Roo');
      locationDirectionsBtn.href = loc.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${destQuery}`;
    }
    const locationContactBtn = document.getElementById('locationContactBtn');
    if (locationContactBtn) {
      const waEncoded = encodeURIComponent(waDefaultMsg);
      locationContactBtn.href = `https://wa.me/${waNumber}?text=${waEncoded}`;
    }

    // Mapa Interactivo de Google Maps
    const locationMapIframe = document.getElementById('locationMapIframe');
    if (locationMapIframe) {
      const mapQuery = encodeURIComponent(loc.mapEmbedQuery || loc.fullPostalAddress || loc.address || 'Av. Álvaro Obregón 168, Chetumal, Quintana Roo');
      locationMapIframe.src = `https://maps.google.com/maps?q=${mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    }

    // Insignia Flotante en el Mapa
    const storeBadge = loc.mapStoreBadge || {};
    const mapCardStoreKicker = document.getElementById('mapCardStoreKicker');
    if (mapCardStoreKicker) {
      mapCardStoreKicker.textContent = storeBadge.kicker || 'TE ESPERAMOS EN';
    }
    const mapCardStoreName = document.getElementById('mapCardStoreName');
    if (mapCardStoreName) {
      mapCardStoreName.textContent = storeBadge.name || brandTitle || 'María Bonita';
    }
    const mapCardStoreDesc = document.getElementById('mapCardStoreDesc');
    if (mapCardStoreDesc) {
      mapCardStoreDesc.textContent = storeBadge.desc || 'Café · Historia · Experiencia';
    }

    const mobileNavAddress = document.getElementById('mobileNavAddress');
    if (mobileNavAddress) {
      mobileNavAddress.textContent = loc.address || '';
    }

    // Enlaces de la Barra Superior
    if (DOM.topNoticeLocation && (loc.cityZone || data.address)) {
      DOM.topNoticeLocation.textContent = `📍 ${loc.cityZone || 'Chetumal, Q. Roo'}`;
    }
    if (DOM.topNoticePhone) {
      DOM.topNoticePhone.href = `tel:${phoneCall}`;
      DOM.topNoticePhone.textContent = `📞 ${phoneDisplay}`;
    }

    // 6. Stats / Métricas de la Cafetería
    const statsList = data.stats || [];
    if (DOM.statsGrid && statsList.length > 0) {
      DOM.statsGrid.innerHTML = statsList.map(s => `
        <div class="stat-box">
          <div class="stat-number">${s.number}</div>
          <div class="stat-label">${s.label}</div>
          <div class="stat-desc">${s.desc}</div>
        </div>
      `).join('');
    }

    // 7. Redes Sociales en Footer
    if (data.socials) {
      const ig = document.getElementById('footerSocialInstagram');
      const fb = document.getElementById('footerSocialFacebook');
      const wa = document.getElementById('footerSocialWhatsapp');
      if (ig && data.socials.instagram) ig.href = data.socials.instagram;
      if (fb && data.socials.facebook) fb.href = data.socials.facebook;
      if (wa && (data.socials.whatsapp || waNumber)) wa.href = data.socials.whatsapp || `https://wa.me/${waNumber}`;
    }
  }

  // --- INICIALIZACIÓN DE EVENT LISTENERS ---
  function initEventListeners() {
    // Búsqueda en tiempo real
    if (DOM.menuSearchInput) {
      DOM.menuSearchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        if (DOM.clearSearchBtn) {
          DOM.clearSearchBtn.classList.toggle('visible', state.searchQuery.length > 0);
        }
        renderDishes();
      });
    }

    if (DOM.clearSearchBtn) {
      DOM.clearSearchBtn.addEventListener('click', () => {
        state.searchQuery = '';
        if (DOM.menuSearchInput) {
          DOM.menuSearchInput.value = '';
          DOM.menuSearchInput.focus();
        }
        DOM.clearSearchBtn.classList.remove('visible');
        renderDishes();
      });
    }

    // Filtros secundarios rápidos
    if (DOM.secondaryFilters) {
      DOM.secondaryFilters.querySelectorAll('.secondary-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          DOM.secondaryFilters.querySelectorAll('.secondary-filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.secondaryFilter = btn.getAttribute('data-filter') || 'all';
          renderDishes();
        });
      });
    }

    // Atajo de teclado para buscar (presionar '/')
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== DOM.menuSearchInput && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const catalog = document.getElementById('catalogo');
        if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => DOM.menuSearchInput?.focus(), 300);
      }
      if (e.key === 'Escape') {
        closeModal();
        closeCart();
        closeMobileNav();
      }
    });

    if (DOM.openSearchBtn) {
      DOM.openSearchBtn.addEventListener('click', () => {
        const catalog = document.getElementById('catalogo');
        if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => DOM.menuSearchInput?.focus(), 350);
      });
    }

    // Abrir y cerrar Carrito
    function openCart() {
      DOM.cartDrawerOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeCart() {
      DOM.cartDrawerOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (DOM.openCartBtn) DOM.openCartBtn.addEventListener('click', openCart);
    if (DOM.fabOrderBtn) DOM.fabOrderBtn.addEventListener('click', openCart);
    if (DOM.closeCartBtn) DOM.closeCartBtn.addEventListener('click', closeCart);
    if (DOM.cartDrawerOverlay) {
      DOM.cartDrawerOverlay.addEventListener('click', (e) => {
        if (e.target === DOM.cartDrawerOverlay) closeCart();
      });
    }

    // Opciones de tipo de servicio en comanda (Mesa / Llevar)
    if (DOM.btnServiceDineIn && DOM.btnServiceTakeaway) {
      DOM.btnServiceDineIn.addEventListener('click', () => {
        state.serviceType = 'mesa';
        DOM.btnServiceDineIn.classList.add('active');
        DOM.btnServiceTakeaway.classList.remove('active');
        if (DOM.tableNumberInput) DOM.tableNumberInput.placeholder = 'Número de mesa (ej. Mesa 4)';
      });

      DOM.btnServiceTakeaway.addEventListener('click', () => {
        state.serviceType = 'llevar';
        DOM.btnServiceTakeaway.classList.add('active');
        DOM.btnServiceDineIn.classList.remove('active');
        if (DOM.tableNumberInput) DOM.tableNumberInput.placeholder = 'Nombre para recoger (ej. Mariana)';
      });
    }

    // Vaciar carrito
    if (DOM.clearCartBtn) {
      DOM.clearCartBtn.addEventListener('click', () => {
        if (confirm('¿Deseas vaciar todos los platillos de tu selección?')) {
          state.cart = [];
          saveCartToStorage();
          updateCartUI();
          showToast('Tu comanda ha sido vaciada');
        }
      });
    }

    // Enviar por WhatsApp
    if (DOM.sendOrderWhatsAppBtn) {
      DOM.sendOrderWhatsAppBtn.addEventListener('click', sendOrderViaWhatsApp);
    }

    // Modal de Detalle Cerrar
    if (DOM.closeModalBtn) DOM.closeModalBtn.addEventListener('click', closeModal);
    if (DOM.dishModalOverlay) {
      DOM.dishModalOverlay.addEventListener('click', (e) => {
        if (e.target === DOM.dishModalOverlay) closeModal();
      });
    }

    // Menú Móvil
    function openMobileNav() {
      DOM.mobileNavDrawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileNav() {
      DOM.mobileNavDrawer.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (DOM.mobileMenuBtn) DOM.mobileMenuBtn.addEventListener('click', openMobileNav);
    if (DOM.closeMobileNavBtn) DOM.closeMobileNavBtn.addEventListener('click', closeMobileNav);
    if (DOM.mobileNavDrawer) {
      DOM.mobileNavDrawer.addEventListener('click', (e) => {
        if (e.target === DOM.mobileNavDrawer) closeMobileNav();
      });
    }
    document.querySelectorAll('.close-mobile-on-click').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });

    // Efecto scrolled en Header
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        DOM.siteHeader?.classList.add('scrolled');
      } else {
        DOM.siteHeader?.classList.remove('scrolled');
      }
    });
  }

  // --- ARRANQUE DE LA APLICACIÓN ---
  function init() {
    renderHero3DSpotlight();
    renderCategories();
    renderSpecials();
    renderDishes();
    renderCafeMeta();
    loadCartFromStorage();
    initEventListeners();
    console.log('Cafetería María Bonita - Menú Digital inicializado correctamente.');
  }

  // Inicializar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
