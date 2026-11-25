'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useMenuData } from '../context/MenuDataContext';
import { recordNewOrder } from '../utils/orderStorage';
import { evaluateBillingStatus } from '../lib/billingStatus';

export default function CartDrawer() {
  const { businessData: BUSINESS_DATA } = useMenuData();
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

  const [orderType, setOrderType] = useState('pickup'); // 'pickup' | 'delivery'
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo'); // 'efectivo' | 'transferencia'
  const [formError, setFormError] = useState('');
  const [billingStatus, setBillingStatus] = useState(null);

  const allowTransfer = BUSINESS_DATA?.paymentConfig?.allowTransfer !== false;

  useEffect(() => {
    let isMounted = true;
    const checkBilling = async () => {
      try {
        const res = await fetch('/api/billing/status').then((r) => r.json()).catch(() => null);
        if (isMounted && res?.billingStatus) {
          setBillingStatus(res.billingStatus);
          return;
        }
      } catch (err) {}
      if (isMounted) {
        setBillingStatus(evaluateBillingStatus());
      }
    };
    checkBilling();
    window.addEventListener('mb_billing_renewed', checkBilling);
    window.addEventListener('storage', checkBilling);
    return () => {
      isMounted = false;
      window.removeEventListener('mb_billing_renewed', checkBilling);
      window.removeEventListener('storage', checkBilling);
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const contact = BUSINESS_DATA.contact || {};
  const whatsappNumber = contact.whatsappRaw || '529831226847';
  const isSuspended =
    Boolean(BUSINESS_DATA?.platformBilling?.isSuspended) ||
    (billingStatus !== null && !billingStatus.canSendWhatsappOrder);

  const sendWhatsAppOrder = () => {
    if (cart.length === 0) return;

    if (!customerName.trim()) {
      setFormError('Por favor ingresa tu nombre para identificar el pedido.');
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setFormError('Por favor proporciona la dirección para la entrega a domicilio.');
      return;
    }

    setFormError('');

    // Verificar si la plataforma se encuentra en modo solo lectura por morosidad o pausa manual
    if (isSuspended) {
      alert(
        billingStatus?.customerNotice?.message ||
          'Los pedidos por WhatsApp se encuentran pausados temporalmente. Puedes revisar todo nuestro menú y ordenar directamente con el personal en nuestro establecimiento.'
      );
      return;
    }

    const brandName = BUSINESS_DATA.brand?.name || 'Cafetería María Bonita';

    const cleanCustomerName = customerName
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    let msg = `¡Hola! Me gustaría hacer un pedido en *${brandName}*:\n\n`;
    msg += `*Cliente:* ${cleanCustomerName}\n`;

    if (orderType === 'delivery') {
      msg += `*Modalidad:* Servicio a domicilio\n`;
      msg += `*Dirección de entrega:* ${deliveryAddress.trim()}\n`;
      if (deliveryNotes.trim()) {
        msg += `*Referencias:* ${deliveryNotes.trim()}\n`;
      }
    } else {
      msg += `*Modalidad:* Pasar a recoger al establecimiento\n`;
    }

    if (paymentMethod === 'transferencia') {
      msg += `*Forma de pago:* Transferencia bancaria (por favor compártanme sus datos de cuenta/CLABE para realizar la transferencia)\n`;
    } else {
      msg += `*Forma de pago:* Efectivo\n`;
    }

    msg += `\n*Productos ordenados:*\n`;

    cart.forEach((item) => {
      msg += `- *${item.quantity}x ${item.name}* (${formatMoney(
        (item.finalPrice || item.price) * item.quantity
      )})\n`;

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
        msg += `  - Opciones: ${optionsLines.join(' | ')}\n`;
      }
      if (item.notes) {
        msg += `  - Nota: ${item.notes}\n`;
      }
    });

    msg += `\n*Total a pagar:* ${formatMoney(cartSubtotal)} MXN\n\n`;
    msg += `¿Me podrían confirmar si tienen todo disponible y el tiempo aproximado para tenerlo listo? ¡Muchas gracias!\n\n`;
    msg += `_Este mensaje fue generado por la plataforma de Menú Digital_`;

    // Registrar pedido en el sistema contable de la plataforma
    try {
      recordNewOrder({
        orderType: orderType === 'delivery' ? 'A Domicilio' : 'Pasar a Buscar',
        customerRef: customerName.trim() + (orderType === 'delivery' ? ` — ${deliveryAddress.trim()}` : ''),
        paymentMethod: paymentMethod === 'transferencia' ? 'Transferencia' : 'Efectivo',
        items: cart,
        total: cartSubtotal,
      });
    } catch (e) {
      console.warn('Error recording order:', e);
    }

    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encoded}`, '_blank');
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
              {/* Encabezado decorativo de configuración */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', paddingBottom: '0.55rem', borderBottom: '1.5px solid rgba(194, 84, 40, 0.12)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontSize: '1.05rem' }}>⚙️</span>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#2a170e', letterSpacing: '-0.01em' }}>
                    Configuración del Pedido
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#fceddf', color: '#c25428', padding: '0.2rem 0.55rem', borderRadius: '20px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                  Paso Final
                </span>
              </div>

              {/* Selector de Servicio */}
              <span className="order-type-label">🛵 Modalidad de Entrega:</span>
              <div className="order-type-tabs">
                <button
                  type="button"
                  className={`order-type-tab-btn ${orderType === 'pickup' ? 'active' : ''}`}
                  onClick={() => {
                    setOrderType('pickup');
                    setFormError('');
                  }}
                >
                  🛍️ Pasar a buscar
                </button>
                <button
                  type="button"
                  className={`order-type-tab-btn ${orderType === 'delivery' ? 'active' : ''}`}
                  onClick={() => {
                    setOrderType('delivery');
                    setFormError('');
                  }}
                >
                  🛵 A Domicilio
                </button>
              </div>

              {/* Nombre del cliente */}
              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 700, color: '#3c2316', marginBottom: '0.25rem' }}>
                  <span>👤 Nombre de quien ordena:</span> <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  className="table-input-field"
                  style={{ marginTop: 0 }}
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="Ingresa tu nombre y apellido"
                  maxLength={50}
                />
              </div>

              {/* Domicilio de entrega si es delivery, o aviso de recolección si es pickup */}
              {orderType === 'delivery' ? (
                <div style={{ marginTop: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 700, color: '#3c2316', marginBottom: '0.25rem' }}>
                    <span>📍 Domicilio de entrega:</span> <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="table-input-field"
                    style={{ marginTop: 0 }}
                    value={deliveryAddress}
                    onChange={(e) => {
                      setDeliveryAddress(e.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="Calle, número exterior/interior y colonia"
                    maxLength={120}
                  />
                  <input
                    type="text"
                    className="table-input-field"
                    style={{ marginTop: '0.45rem', fontSize: '0.8rem' }}
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="🧭 Referencias de llegada (ej. Fachada blanca, portón café)"
                    maxLength={100}
                  />
                </div>
              ) : (
                <div style={{ marginTop: '0.65rem', background: 'linear-gradient(135deg, #fffcf9 0%, #faf3eb 100%)', border: '1.5px dashed #debda2', borderRadius: '10px', padding: '0.65rem 0.85rem', fontSize: '0.78rem', color: '#4a382c', lineHeight: 1.4, display: 'flex', gap: '0.55rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>📍</span>
                  <div>
                    <strong style={{ color: '#2a170e', display: 'block', marginBottom: '0.15rem' }}>Recoger en barra del establecimiento:</strong>
                    <span>{BUSINESS_DATA.location?.address || 'Av. Álvaro Obregón #168, Col. Centro, Chetumal, Q. Roo'}</span>
                    <div style={{ fontSize: '0.72rem', color: '#8c6549', marginTop: '0.25rem', fontWeight: 600 }}>
                      ✨ Prepararemos tu orden al momento para que la disfrutes fresca.
                    </div>
                  </div>
                </div>
              )}

              {/* Forma de pago */}
              <div style={{ marginTop: '0.75rem' }}>
                <label className="order-type-label" style={{ marginBottom: '0.35rem' }}>
                  💳 Forma de pago:
                </label>
                {allowTransfer ? (
                  <>
                    <div className="order-type-tabs">
                      <button
                        type="button"
                        className={`order-type-tab-btn ${paymentMethod === 'efectivo' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('efectivo')}
                      >
                        💵 Efectivo
                      </button>
                      <button
                        type="button"
                        className={`order-type-tab-btn ${paymentMethod === 'transferencia' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('transferencia')}
                      >
                        🏦 Transferencia
                      </button>
                    </div>
                    {paymentMethod === 'transferencia' && (
                      <div style={{ marginTop: '0.5rem', background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '10px', padding: '0.55rem 0.75rem', fontSize: '0.76rem', color: '#0369a1', lineHeight: 1.4, display: 'flex', gap: '0.45rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>ℹ️</span>
                        <span>El establecimiento te compartirá los datos bancarios (CLABE / Cuenta) por WhatsApp para realizar tu transferencia.</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.6rem 0.85rem', background: '#ffffff', border: '1.5px solid #d1fae5', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                    <span style={{ fontSize: '1.25rem' }}>💵</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>Pago en Efectivo</div>
                      <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>Liquidación directa al momento de recibir o recoger</div>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>✓ Activo</span>
                  </div>
                )}
              </div>

              {/* Mensaje de validación amigable */}
              {formError && (
                <div style={{ marginTop: '0.65rem', color: '#b91c1c', fontSize: '0.78rem', background: '#fee2e2', border: '1px solid #fecaca', padding: '0.45rem 0.65rem', borderRadius: '6px', textAlign: 'center', fontWeight: 600 }}>
                  ⚠️ {formError}
                </div>
              )}
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

            {/* Botón de Enviar Pedido o Aviso Neutro de Modo Solo Lectura */}
            {isSuspended ? (
              <div
                className="cart-readonly-notice"
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '1rem',
                  margin: '0.85rem 0',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '0.25rem' }}>📋</span>
                <strong style={{ display: 'block', color: '#991b1b', fontSize: '0.925rem' }}>
                  Menú solo consulta
                </strong>
                <p style={{ margin: '0.35rem 0 0 0', color: '#7f1d1d', fontSize: '0.8rem', lineHeight: 1.45 }}>
                  {billingStatus?.customerNotice?.message ||
                    'Los pedidos por WhatsApp se encuentran pausados temporalmente. Puedes revisar todo nuestro menú y ordenar directamente con el personal en nuestro establecimiento.'}
                </p>
              </div>
            ) : (
              <button type="button" className="btn-whatsapp-order" onClick={sendWhatsAppOrder}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <span>Enviar Pedido por WhatsApp</span>
              </button>
            )}

            <button type="button" className="btn-clear-cart" onClick={clearCart}>
              Vaciar toda la selección
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
