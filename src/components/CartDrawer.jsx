'use client';

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { BUSINESS_DATA } from '../data/menuData';
import { recordNewOrder } from '../utils/orderStorage';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    totalItemsCount,
    formatMoney,
  } = useCart();

  const [orderType, setOrderType] = useState('mesa'); // 'mesa' | 'llevar'
  const [tableOrName, setTableOrName] = useState('');

  if (!isCartOpen) return null;

  const contact = BUSINESS_DATA.contact || {};
  const whatsappNumber = contact.whatsappRaw || '529831226847';

  const sendWhatsAppOrder = () => {
    if (cart.length === 0) return;

    let msg = `*NUEVA COMANDA - ${BUSINESS_DATA.brand?.name || 'CAFETERÍA MARÍA BONITA'}*\n`;
    msg += `📅 ${new Date().toLocaleDateString('es-MX')} | ⏰ ${new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    })}\n`;
    msg += `--------------------------------\n`;

    const typeStr = orderType === 'mesa' ? '🍽️ Consumo en Mesa' : '🛍️ Para Llevar';
    msg += `*Tipo de Servicio:* ${typeStr}\n`;
    if (tableOrName.trim()) {
      msg += `*Mesa / Referencia:* ${tableOrName.trim()}\n`;
    }
    msg += `--------------------------------\n`;
    msg += `*DETALLE DE PLATILLOS:*\n\n`;

    cart.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.quantity}x ${item.name}* — ${formatMoney(
        (item.finalPrice || item.price) * item.quantity
      )}\n`;

      const opts = item.selectedOptions || {};
      const optionsLines = [];
      Object.keys(opts).forEach((k) => {
        if (k === 'extras' && Array.isArray(opts.extras) && opts.extras.length > 0) {
          optionsLines.push(`Extras: ${opts.extras.map((e) => e.name).join(', ')}`);
        } else if (opts[k]) {
          const val = typeof opts[k] === 'object' ? opts[k].label : opts[k];
          optionsLines.push(val);
        }
      });
      if (optionsLines.length > 0) {
        msg += `   └ _${optionsLines.join(' | ')}_\n`;
      }
      if (item.notes) {
        msg += `   └ _Nota: ${item.notes}_\n`;
      }
      msg += `\n`;
    });

    msg += `--------------------------------\n`;
    msg += `*TOTAL A PAGAR:* ${formatMoney(cartSubtotal)} MXN\n`;
    msg += `--------------------------------\n`;
    msg += `_Comanda enviada desde el Menú Digital_`;

    // Registrar pedido en el sistema contable de la plataforma para comisión
    try {
      recordNewOrder({
        orderType,
        tableOrName,
        items: cart,
        total: cartSubtotal,
      });
    } catch (e) {
      console.warn('Error recording order:', e);
    }

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div
      className="cart-drawer-overlay open"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCartOpen(false);
      }}
    >
      <div className="cart-drawer-panel">
        {/* Encabezado del Carrito */}
        <div className="cart-drawer-header">
          <h3 className="cart-drawer-title">
            <span>🛍️</span>
            <span>Mi Pedido / Comanda</span>
          </h3>
          <button
            type="button"
            id="closeCartBtn"
            onClick={() => setIsCartOpen(false)}
            style={{ fontSize: '1.4rem', color: 'var(--espresso-900)', padding: '0.4rem', background: 'none', border: 'none', cursor: 'pointer' }}
            aria-label="Cerrar comanda"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo del Carrito con Ítems */}
        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">☕</div>
              <h4 style={{ fontSize: '1.15rem', color: 'var(--espresso-900)' }}>Tu comanda está vacía</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Explora nuestro menú y selecciona tus bebidas o platillos favoritos para enviar tu pedido directo a cocina.
              </p>
              <button
                type="button"
                className="btn-primary"
                style={{ marginTop: '1rem', padding: '0.6rem 1.4rem', fontSize: '0.85rem' }}
                onClick={() => setIsCartOpen(false)}
              >
                Ver el menú
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map((item, idx) => (
                <div className="cart-item-card" key={idx}>
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'}
                    alt={item.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 className="cart-item-title">{item.name}</h4>
                      <button
                        type="button"
                        className="cart-item-remove-btn"
                        onClick={() => removeFromCart(idx)}
                        aria-label={`Eliminar ${item.name}`}
                      >
                        ✕
                      </button>
                    </div>
                    {item.customizations && (
                      <span className="cart-item-custom-notes">{item.customizations}</span>
                    )}
                    {item.notes && (
                      <span className="cart-item-custom-notes" style={{ color: 'var(--terracotta-600)', fontStyle: 'italic' }}>
                        “{item.notes}”
                      </span>
                    )}
                    <div className="cart-item-row-action">
                      <span className="cart-item-price">{formatMoney((item.finalPrice || item.price) * item.quantity)}</span>
                      <div className="cart-mini-stepper">
                        <button type="button" onClick={() => updateQuantity(idx, -1)} aria-label="Restar">-</button>
                        <span>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(idx, 1)} aria-label="Sumar">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pie del Carrito con Subtotal y Botón de WhatsApp */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="order-type-box" style={{ marginBottom: '1rem' }}>
              <span className="order-type-label">Tipo de Servicio:</span>
              <div className="order-type-tabs">
                <button
                  type="button"
                  className={`order-type-tab-btn ${orderType === 'mesa' ? 'active' : ''}`}
                  onClick={() => setOrderType('mesa')}
                >
                  🍽️ Consumo en Mesa
                </button>
                <button
                  type="button"
                  className={`order-type-tab-btn ${orderType === 'llevar' ? 'active' : ''}`}
                  onClick={() => setOrderType('llevar')}
                >
                  🛍️ Para Llevar
                </button>
              </div>
              <input
                type="text"
                className="table-input-field"
                value={tableOrName}
                onChange={(e) => setTableOrName(e.target.value)}
                placeholder="Número de mesa o nombre de quien ordena"
                maxLength={30}
              />
            </div>

            <div className="cart-summary-line">
              <span>Subtotal estimado:</span>
              <span>{formatMoney(cartSubtotal)}</span>
            </div>
            <div className="cart-summary-line">
              <span>Envase / Servicio:</span>
              <span style={{ color: '#15803d', fontWeight: 700 }}>Gratis</span>
            </div>
            <div className="cart-summary-line total">
              <span>Total a pagar:</span>
              <span>{formatMoney(cartSubtotal)} MXN</span>
            </div>

            <button type="button" className="btn-whatsapp-order" onClick={sendWhatsAppOrder}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>Enviar Pedido por WhatsApp</span>
            </button>

            <button type="button" className="btn-clear-cart" onClick={clearCart}>
              Vaciar toda la selección
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
