'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext';

export default function DishDetailModal() {
  const { selectedDish, setSelectedDish, addToCart, formatMoney } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [selectedMilk, setSelectedMilk] = useState(null);
  const [selectedSalsa, setSelectedSalsa] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [specialNotes, setSpecialNotes] = useState('');

  // Reset state whenever a new dish is opened
  useEffect(() => {
    if (selectedDish) {
      setQuantity(1);
      setSpecialNotes('');
      setSelectedExtras([]);
      setSelectedSizeIndex(0);

      const opts = selectedDish.options || {};
      if (opts.leche && opts.leche.length > 0) {
        setSelectedMilk(opts.leche[0]);
      } else {
        setSelectedMilk(null);
      }

      if (opts.salsa && opts.salsa.length > 0) {
        setSelectedSalsa(opts.salsa[0]);
      } else {
        setSelectedSalsa(null);
      }
    }
  }, [selectedDish]);

  // Handle escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSelectedDish(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSelectedDish]);

  // Calculate unit price and total price
  const { unitPrice, totalPrice } = useMemo(() => {
    if (!selectedDish) return { unitPrice: 0, totalPrice: 0 };
    let extraCost = 0;

    const opts = selectedDish.options || {};
    // Check sizes
    if (opts.sizes && opts.sizes[selectedSizeIndex]) {
      extraCost += opts.sizes[selectedSizeIndex].extraPrice || 0;
    }

    // Check milk extra
    if (selectedMilk) {
      const match = selectedMilk.match(/\+\s*\$(\d+)/);
      if (match) {
        extraCost += parseInt(match[1], 10);
      }
    }

    // Check extras
    selectedExtras.forEach((ex) => {
      if (ex && ex.price) {
        extraCost += ex.price;
      }
    });

    const singlePrice = selectedDish.price + extraCost;
    return {
      unitPrice: singlePrice,
      totalPrice: singlePrice * quantity,
    };
  }, [selectedDish, selectedSizeIndex, selectedMilk, selectedExtras, quantity]);

  if (!selectedDish) return null;

  const toggleExtra = (extra) => {
    setSelectedExtras((prev) => {
      const exists = prev.some((e) => e.name === extra.name);
      if (exists) {
        return prev.filter((e) => e.name !== extra.name);
      }
      return [...prev, extra];
    });
  };

  const handleAddToCart = () => {
    const opts = selectedDish.options || {};
    const chosenOptions = {};

    if (opts.sizes && opts.sizes[selectedSizeIndex]) {
      chosenOptions.tamano = opts.sizes[selectedSizeIndex].label;
    }
    if (selectedMilk) {
      chosenOptions.leche = selectedMilk;
    }
    if (selectedSalsa) {
      chosenOptions.salsa = selectedSalsa;
    }
    if (selectedExtras.length > 0) {
      chosenOptions.extras = selectedExtras;
    }

    addToCart({
      id: selectedDish.id,
      name: selectedDish.name,
      category: selectedDish.category,
      basePrice: selectedDish.price,
      finalPrice: unitPrice,
      quantity,
      selectedOptions: chosenOptions,
      notes: specialNotes.trim(),
    });
    setSelectedDish(null);
  };

  const opts = selectedDish.options || {};
  const fallbackSrc = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      className="dish-modal-overlay open"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedDish(null);
      }}
    >
      <div className="dish-modal-card">
        <button
          type="button"
          className="modal-close-btn"
          onClick={() => setSelectedDish(null)}
          aria-label="Cerrar ventana"
        >
          ✕
        </button>

        <div className="modal-hero-img-wrap">
          <img
            src={selectedDish.image}
            alt={selectedDish.name}
            className="modal-hero-img"
            onError={(e) => {
              e.currentTarget.src = fallbackSrc;
            }}
          />
          {selectedDish.badge && (
            <span className="special-badge-ribbon">⭐ {selectedDish.badge}</span>
          )}
        </div>

        <div className="modal-content-body">
          <div className="modal-header-info">
            <div className="dish-tags-row">
              {selectedDish.tags?.map((t, idx) => (
                <span key={idx} className="tag-chip">{t}</span>
              ))}
            </div>
            <h3 className="modal-title">{selectedDish.name}</h3>
            <p className="modal-desc">{selectedDish.description || selectedDish.shortDescription}</p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {selectedDish.calories && <span>🔥 {selectedDish.calories}</span>}
              {selectedDish.calories && selectedDish.prepTime && <span>•</span>}
              {selectedDish.prepTime && <span>⏱️ {selectedDish.prepTime}</span>}
            </div>
          </div>

          {/* Opciones Dinámicas de Personalización */}
          {/* 1. Tamaños */}
          {opts.sizes && opts.sizes.length > 0 && (
            <div className="custom-section-block">
              <div className="custom-section-title">
                <span>Selecciona Tamaño / Presentación:</span>
                <span className="req-badge">Requerido</span>
              </div>
              <div className="custom-options-grid">
                {opts.sizes.map((s, idx) => (
                  <label key={idx} className="custom-option-label">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <input
                        type="radio"
                        name="modal_size"
                        value={idx}
                        checked={selectedSizeIndex === idx}
                        onChange={() => setSelectedSizeIndex(idx)}
                      />
                      <span>{s.label}</span>
                    </div>
                    <strong>{s.extraPrice > 0 ? `+ ${formatMoney(s.extraPrice)}` : 'Incluido'}</strong>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 2. Tipo de Leche */}
          {opts.leche && opts.leche.length > 0 && (
            <div className="custom-section-block">
              <div className="custom-section-title">
                <span>Tipo de Leche:</span>
                <span className="req-badge">Requerido</span>
              </div>
              <div className="custom-options-grid">
                {opts.leche.map((milk, idx) => (
                  <label key={idx} className="custom-option-label">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <input
                        type="radio"
                        name="modal_leche"
                        value={milk}
                        checked={selectedMilk === milk}
                        onChange={() => setSelectedMilk(milk)}
                      />
                      <span>{milk}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 3. Tipo de Salsa */}
          {opts.salsa && opts.salsa.length > 0 && (
            <div className="custom-section-block">
              <div className="custom-section-title">
                <span>Salsa para tus Chilaquiles / Huevos:</span>
                <span className="req-badge">Requerido</span>
              </div>
              <div className="custom-options-grid">
                {opts.salsa.map((salsa, idx) => (
                  <label key={idx} className="custom-option-label">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <input
                        type="radio"
                        name="modal_salsa"
                        value={salsa}
                        checked={selectedSalsa === salsa}
                        onChange={() => setSelectedSalsa(salsa)}
                      />
                      <span>{salsa}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 4. Extras Opcionales */}
          {opts.extras && opts.extras.length > 0 && (
            <div className="custom-section-block">
              <div className="custom-section-title">
                <span>Extras e Ingredientes Especiales:</span>
                <span className="req-badge">Opcional</span>
              </div>
              <div className="custom-options-grid">
                {opts.extras.map((extra, idx) => {
                  const isChecked = selectedExtras.some((e) => e.name === extra.name);
                  return (
                    <label key={idx} className="custom-option-label">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleExtra(extra)}
                        />
                        <span>{extra.name}</span>
                      </div>
                      <strong>+ {formatMoney(extra.price)}</strong>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notas para Cocina */}
          <div className="custom-section-block">
            <div className="custom-section-title">
              <span>Notas para cocina o barista:</span>
              <span className="req-badge">Opcional</span>
            </div>
            <textarea
              className="modal-notes-area"
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="Ej. Sin cebolla, leche tibia, salsa aparte, bien caliente..."
            ></textarea>
          </div>

          {/* Selector de Cantidad y Botón de Agregar */}
          <div className="modal-footer-action">
            <div className="quantity-stepper">
              <button
                type="button"
                className="stepper-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Restar"
              >
                -
              </button>
              <span className="stepper-val">{quantity}</span>
              <button
                type="button"
                className="stepper-btn"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Sumar"
              >
                +
              </button>
            </div>
            <button type="button" className="btn-modal-add-cart" onClick={handleAddToCart}>
              <span>Agregar a Mi Pedido</span>
              <span style={{ fontFamily: 'var(--font-serif)' }}>{formatMoney(totalPrice)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
