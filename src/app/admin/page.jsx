'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { BUSINESS_DATA, formatMoney } from '../../data/menuData';
import {
  getStoredOrders,
  getBillingSummary,
  getBillingHistory,
  processStripePayment,
  addMockOrder,
} from '../../utils/orderStorage';
import {
  evaluateBillingStatus,
  renewBillingCycle,
  generateWhatsappReminderMessage,
} from '../../lib/billingStatus';

export default function AdminBillingPage() {
  const billingConfig = BUSINESS_DATA.platformBilling || {
    commissionPerOrder: 3,
    currency: 'MXN',
    cycleDays: 30,
    ownerPin: '2026',
    stripePublishableKey: 'pk_test_TYooMQauvdEDq54NiTphI7jx',
    companyName: 'RedaySoft Software & Menús Digitales',
    supportEmail: 'facturacion@redaysoft.com',
  };

  // Autenticación de dueño por PIN
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Datos de facturación y pedidos
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [ordersFilter, setOrdersFilter] = useState('all'); // 'all' | 'unpaid' | 'paid'
  const [subStatus, setSubStatus] = useState(null);

  // Estado del pago con Stripe
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState(null);
  const [selectedReceiptForModal, setSelectedReceiptForModal] = useState(null);

  // Formulario de tarjeta simulado de Stripe
  const [cardName, setCardName] = useState('Miguel Protonotario');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('•••');

  // Cargar sesión y datos
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = sessionStorage.getItem('mb_admin_authenticated');
      if (savedAuth === 'true') {
        setIsAuthenticated(true);
      }
    }
    refreshData();
  }, []);

  // Escuchar eventos de nuevos pedidos
  useEffect(() => {
    const handleOrderChange = () => refreshData();
    window.addEventListener('mb_order_recorded', handleOrderChange);
    window.addEventListener('mb_billing_updated', handleOrderChange);
    return () => {
      window.removeEventListener('mb_order_recorded', handleOrderChange);
      window.removeEventListener('mb_billing_updated', handleOrderChange);
    };
  }, []);

  const refreshData = () => {
    setSummary(getBillingSummary());
    setOrders(getStoredOrders());
    setHistory(getBillingHistory());
    setSubStatus(evaluateBillingStatus());
  };

  const handleRenewCycle = () => {
    const res = renewBillingCycle({ pin: billingConfig.ownerPin, monthsToAdd: 1 });
    if (res.success) {
      alert(`✅ ${res.message}`);
      refreshData();
    } else {
      alert(`⚠️ ${res.message}`);
    }
  };

  const handleSendTestWhatsApp = () => {
    if (!subStatus) return;
    const msg = generateWhatsappReminderMessage(subStatus);
    const phone = subStatus.billingPhone || '529831226847';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === String(billingConfig.ownerPin).trim()) {
      setIsAuthenticated(true);
      setPinError(false);
      sessionStorage.setItem('mb_admin_authenticated', 'true');
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('mb_admin_authenticated');
    setPinInput('');
  };

  const handleAddDemoOrder = () => {
    addMockOrder();
    refreshData();
  };

  const handlePayWithStripe = (e) => {
    e.preventDefault();
    if (!summary || summary.pendingCommissionAmount <= 0) return;

    setIsProcessingPayment(true);

    // Simular latencia de verificación segura con los servidores de Stripe
    setTimeout(() => {
      const result = processStripePayment({
        paymentMethod: 'Tarjeta de Crédito / Débito',
        last4: cardNumber.replace(/\D/g, '').slice(-4) || '4242',
      });

      setIsProcessingPayment(false);

      if (result.success) {
        setPaymentSuccessReceipt(result.receipt);
        refreshData();
      } else {
        alert(result.message || 'Error al procesar el pago en Stripe');
      }
    }, 1400);
  };

  // Filtrado de pedidos
  const filteredOrders = useMemo(() => {
    if (ordersFilter === 'unpaid') return orders.filter((o) => !o.paid);
    if (ordersFilter === 'paid') return orders.filter((o) => o.paid);
    return orders;
  }, [orders, ordersFilter]);

  // Si no está autenticado, mostrar pantalla de PIN
  if (!isAuthenticated) {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <div style={styles.authIconWrap}>🔒</div>
          <span style={styles.authKicker}>CAFETERÍA MARÍA BONITA</span>
          <h2 style={styles.authTitle}>Acceso de Administración</h2>
          <p style={styles.authSubtitle}>
            Panel confidencial de contabilización de pedidos y comisiones de plataforma para el dueño del restaurante.
          </p>

          <form onSubmit={handleLogin} style={styles.authForm}>
            <label style={styles.authLabel} htmlFor="pinField">
              Ingresa tu PIN de seguridad:
            </label>
            <input
              id="pinField"
              type="password"
              maxLength={8}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              placeholder="PIN de 4 dígitos"
              style={{
                ...styles.authInput,
                borderColor: pinError ? '#ef4444' : '#d1c7bc',
              }}
              autoFocus
            />
            {pinError && (
              <p style={styles.authErrorMsg}>
                ⚠️ PIN incorrecto. (PIN predeterminado configurado en menuData: {billingConfig.ownerPin})
              </p>
            )}

            <button type="submit" style={styles.authSubmitBtn}>
              Acceder al Panel
            </button>
          </form>

          <div style={styles.authFooter}>
            <Link href="/" style={styles.authBackLink}>
              ← Regresar al Menú Público
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      {/* Barra Superior del Panel */}
      <header style={styles.headerBar}>
        <div style={styles.headerLeft}>
          <div style={styles.brandBadge}>
            ☕ <strong>{BUSINESS_DATA.brand?.name || 'María Bonita'}</strong>
          </div>
          <span style={styles.headerDivider}>|</span>
          <span style={styles.headerPortalTag}>Portal de Facturación & Comisiones</span>
        </div>

        <div style={styles.headerRight}>
          <Link href="/" style={styles.viewMenuBtn}>
            👁️ Ver Menú Público
          </Link>
          <button type="button" onClick={handleLogout} style={styles.logoutBtn}>
            Cerrar Sesión ✕
          </button>
        </div>
      </header>

      <main style={styles.mainContent}>
        {/* Banner de bienvenida y aviso del ciclo */}
        <div style={styles.welcomeBanner}>
          <div>
            <h1 style={styles.bannerTitle}>Control de Pedidos & Liquidación de Plataforma</h1>
            <p style={styles.bannerSubtitle}>
              Tarifa configurada en <strong>menuData</strong>: <strong>${billingConfig.commissionPerOrder} MXN</strong> por
              cada comanda generada a través del carrito de compras • Cuota mensual:{' '}
              <strong>${billingConfig.monthlyFee || 249}.00 {billingConfig.currency}</strong>.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleRenewCycle}
              style={{
                ...styles.demoOrderBtn,
                background: '#15803d',
              }}
              title="Registrar pago manual y sumar 1 mes a la fecha de corte"
            >
              🔄 Renovar Ciclo (+30 Días)
            </button>
            <button
              type="button"
              onClick={handleSendTestWhatsApp}
              style={{
                ...styles.demoOrderBtn,
                background: '#25D366',
                color: '#ffffff',
              }}
              title="Abre WhatsApp con el mensaje oficial de recordatorio y datos SPEI"
            >
              📲 Probar Recordatorio WhatsApp
            </button>
            <button
              type="button"
              onClick={handleAddDemoOrder}
              style={styles.demoOrderBtn}
              title="Genera un pedido de prueba"
            >
              + Simular Pedido (+${billingConfig.commissionPerOrder} MXN)
            </button>
          </div>
        </div>

        {/* Tarjeta de Control de Suscripción & Datos SPEI */}
        {subStatus && (
          <div
            style={{
              background: subStatus.canSendWhatsappOrder ? '#ffffff' : '#fef2f2',
              border: `2px solid ${
                subStatus.status === 'read_only'
                  ? '#ef4444'
                  : subStatus.status === 'grace_period'
                  ? '#f59e0b'
                  : subStatus.status === 'reminder_window'
                  ? '#f97316'
                  : '#22c55e'
              }`,
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                borderBottom: '1px solid #f1ece6',
                paddingBottom: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: subStatus.canSendWhatsappOrder ? '#15803d' : '#b91c1c',
                  }}
                >
                  ESTADO DE SUSCRIPCIÓN • ZONA HORARIA {subStatus.timezone}
                </span>
                <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.3rem', color: '#1f120a' }}>
                  {subStatus.statusBadgeText}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: subStatus.canSendWhatsappOrder ? '#dcfce7' : '#fee2e2',
                    color: subStatus.canSendWhatsappOrder ? '#166534' : '#991b1b',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: subStatus.canSendWhatsappOrder ? '#22c55e' : '#ef4444',
                    }}
                  ></span>
                  {subStatus.canSendWhatsappOrder ? 'Pedidos a WhatsApp Activos' : 'Modo Solo Lectura (Pedidos Pausados)'}
                </span>
              </div>
            </div>

            {/* Aviso especial si está en gracia o en modo solo lectura */}
            {subStatus.ownerAlert && (
              <div
                style={{
                  background:
                    subStatus.ownerAlert.level === 'critical'
                      ? '#fee2e2'
                      : subStatus.ownerAlert.level === 'danger'
                      ? '#fef3c7'
                      : '#ffedd5',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '10px',
                  padding: '0.85rem 1.15rem',
                  marginBottom: '1rem',
                  color: '#1f120a',
                  fontSize: '0.88rem',
                  lineHeight: 1.45,
                }}
              >
                <strong>⚠️ {subStatus.ownerAlert.title}:</strong> {subStatus.ownerAlert.message}
              </div>
            )}

            {/* Desglose de Fechas y Datos SPEI */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ background: '#faf7f2', padding: '1rem', borderRadius: '10px' }}>
                <span style={{ display: 'block', color: '#6b5c52', fontWeight: 700, marginBottom: '0.3rem' }}>
                  📅 Cronograma de Facturación:
                </span>
                <div>Fecha de corte: <strong>{subStatus.nextBillingDate}</strong></div>
                <div>Hoy en Cancún: <strong>{subStatus.todayCancun}</strong></div>
                <div>Días de gracia configurados: <strong>{subStatus.graceDays} días</strong></div>
                <div>Aviso preventivo automático: <strong>{subStatus.reminderDaysBefore} días antes</strong></div>
              </div>

              <div style={{ background: '#faf7f2', padding: '1rem', borderRadius: '10px' }}>
                <span style={{ display: 'block', color: '#6b5c52', fontWeight: 700, marginBottom: '0.3rem' }}>
                  🏦 Datos de Transferencia SPEI:
                </span>
                <div>Banco: <strong>{subStatus.paymentInfo?.bank || 'BBVA México'}</strong></div>
                <div>
                  CLABE:{' '}
                  <code style={{ background: '#ffffff', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                    {subStatus.paymentInfo?.clabe || '012180001234567890'}
                  </code>
                </div>
                <div>Beneficiario: <strong>{subStatus.paymentInfo?.beneficiary || 'RedaySoft'}</strong></div>
                <div>Referencia: <strong>{subStatus.paymentInfo?.reference || 'MARIA-BONITA-01'}</strong></div>
              </div>

              <div style={{ background: '#faf7f2', padding: '1rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ display: 'block', color: '#6b5c52', fontWeight: 700, marginBottom: '0.3rem' }}>
                    💳 Pago Rápido en Línea:
                  </span>
                  <div>Cuota mensual: <strong>${subStatus.monthlyFee}.00 {subStatus.currency}</strong></div>
                  <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.2rem' }}>
                    WhatsApp del dueño: +{subStatus.billingPhone}
                  </div>
                </div>
                {subStatus.paymentInfo?.enablePaymentLink && subStatus.paymentInfo?.paymentLink ? (
                  <a
                    href={subStatus.paymentInfo.paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: '0.75rem',
                      background: '#635bff',
                      color: '#ffffff',
                      textDecoration: 'none',
                      padding: '0.5rem 0.9rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      textAlign: 'center',
                      fontSize: '0.82rem',
                    }}
                  >
                    Abrir Pasarela de Pago ↗
                  </a>
                ) : (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      background: '#e2e8f0',
                      color: '#334155',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      textAlign: 'center',
                    }}
                  >
                    🏦 Cobro exclusivo vía Transferencia SPEI
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tarjetas de Métricas Principales */}
        {summary && (
          <div style={styles.statsGrid}>
            {/* Card 1: Pedidos Totales */}
            <div style={styles.statCard}>
              <div style={styles.statHeader}>
                <span style={styles.statLabel}>Total Pedidos Plataforma</span>
                <span style={styles.statIcon}>🛍️</span>
              </div>
              <div style={styles.statMainValue}>{summary.totalOrdersCount}</div>
              <div style={styles.statSubtext}>
                {summary.unpaidOrdersCount} pendientes de liquidar • {summary.paidOrdersCount} liquidados
              </div>
            </div>

            {/* Card 2: Tarifa por Pedido */}
            <div style={styles.statCard}>
              <div style={styles.statHeader}>
                <span style={styles.statLabel}>Comisión por Pedido</span>
                <span style={styles.statIcon}>🏷️</span>
              </div>
              <div style={styles.statMainValue}>${summary.commissionRate}.00 {summary.currency}</div>
              <div style={styles.statSubtext}>
                Configurado en <code>menuData.platformBilling</code>
              </div>
            </div>

            {/* Card 3: Saldo Pendiente */}
            <div
              style={{
                ...styles.statCard,
                background: summary.pendingCommissionAmount > 0 ? '#fef3e7' : '#f0fdf4',
                borderColor: summary.pendingCommissionAmount > 0 ? '#f97316' : '#22c55e',
              }}
            >
              <div style={styles.statHeader}>
                <span style={styles.statLabel}>Comisión Pendiente de Pago</span>
                <span style={styles.statIcon}>💳</span>
              </div>
              <div
                style={{
                  ...styles.statMainValue,
                  color: summary.pendingCommissionAmount > 0 ? '#c2410c' : '#15803d',
                }}
              >
                {formatMoney(summary.pendingCommissionAmount)} {summary.currency}
              </div>
              <div style={styles.statSubtext}>
                Correspondiente a {summary.unpaidOrdersCount} pedidos sin liquidar
              </div>
            </div>

            {/* Card 4: Ciclo de Facturación (Límite Máximo Mensual) */}
            <div style={styles.statCard}>
              <div style={styles.statHeader}>
                <span style={styles.statLabel}>Límite Máximo de Pago</span>
                <span style={styles.statIcon}>⏳</span>
              </div>
              <div style={styles.statMainValue}>
                {summary.daysRemaining} <span style={{ fontSize: '1rem', fontWeight: 600 }}>días restantes</span>
              </div>
              <div style={styles.statSubtext}>
                Corte cada 30 días • Fecha límite: {new Date(summary.nextDueDate).toLocaleDateString('es-MX')}
              </div>
              {/* Barra de progreso mensual */}
              <div style={styles.progressBarBg}>
                <div
                  style={{
                    ...styles.progressBarFill,
                    width: `${Math.min(100, Math.max(10, ((30 - summary.daysRemaining) / 30) * 100))}%`,
                    background: summary.daysRemaining <= 5 ? '#ef4444' : '#c25428',
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Notificación de Pago Exitoso */}
        {paymentSuccessReceipt && (
          <div style={styles.successAlert}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.8rem' }}>🎉</span>
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem', color: '#166534' }}>
                  ¡Liquidación procesada con éxito a través de Stripe!
                </strong>
                <span style={{ fontSize: '0.9rem', color: '#15803d' }}>
                  Folio: <strong>{paymentSuccessReceipt.folio}</strong> • Importe debitado:{' '}
                  <strong>{formatMoney(paymentSuccessReceipt.totalPaid)} MXN</strong> ({paymentSuccessReceipt.ordersCount}{' '}
                  pedidos liquidados).
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedReceiptForModal(paymentSuccessReceipt)}
              style={styles.viewReceiptBtn}
            >
              📄 Ver Comprobante
            </button>
          </div>
        )}

        <div style={styles.twoColLayout}>
          {/* Columna Izquierda: Pasarela de Pago con Stripe */}
          <section style={styles.stripeCardSection}>
            <div style={styles.sectionHeaderStripe}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={styles.stripeLogoText}>stripe</span>
                <span style={styles.stripeSubTag}>Pasarela de Pago Segura</span>
              </div>
              <span style={styles.sslBadge}>🔒 Cifrado SSL de 256 bits</span>
            </div>

            <div style={styles.stripeBody}>
              <div style={styles.amountBreakdown}>
                <div style={styles.amountLine}>
                  <span>Pedidos pendientes de liquidar:</span>
                  <strong>{summary?.unpaidOrdersCount || 0} pedidos</strong>
                </div>
                <div style={styles.amountLine}>
                  <span>Comisión fija por comanda:</span>
                  <strong>${summary?.commissionRate || 3}.00 MXN</strong>
                </div>
                <div style={styles.amountLine}>
                  <span>Periodo de facturación:</span>
                  <span>Mensual (Límite 30 días)</span>
                </div>
                <div style={styles.amountLineTotal}>
                  <span>Total a Liquidar:</span>
                  <span style={styles.totalAccent}>{formatMoney(summary?.pendingCommissionAmount || 0)} MXN</span>
                </div>
              </div>

              {/* Formulario de Pago */}
              <form onSubmit={handlePayWithStripe} style={styles.paymentForm}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Titular de la Tarjeta / Negocio:</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    style={styles.formInput}
                    placeholder="Nombre como aparece en la tarjeta"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Número de Tarjeta (Stripe Test / Prod):</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    style={styles.formInput}
                    placeholder="4242 4242 4242 4242"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Vencimiento:</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      style={styles.formInput}
                      placeholder="MM/AA"
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>CVC / CVV:</label>
                    <input
                      type="password"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      style={styles.formInput}
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessingPayment || (summary?.pendingCommissionAmount || 0) <= 0}
                  style={{
                    ...styles.payButton,
                    opacity: isProcessingPayment || (summary?.pendingCommissionAmount || 0) <= 0 ? 0.6 : 1,
                    cursor:
                      isProcessingPayment || (summary?.pendingCommissionAmount || 0) <= 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isProcessingPayment ? (
                    <span>Procesando pago con Stripe... ⏳</span>
                  ) : (summary?.pendingCommissionAmount || 0) <= 0 ? (
                    <span>✅ No hay comisiones pendientes</span>
                  ) : (
                    <span>
                      💳 Pagar {formatMoney(summary.pendingCommissionAmount)} MXN con Stripe
                    </span>
                  )}
                </button>
              </form>

              <div style={styles.stripeNote}>
                ℹ️ <strong>Flexibilidad de pago:</strong> Puedes liquidar en cualquier momento que lo desees o esperar al
                corte mensual (máximo cada 30 días). Los fondos son transferidos directamente a la cuenta de la plataforma.
              </div>
            </div>
          </section>

          {/* Columna Derecha: Historial de Comprobantes de Pago */}
          <section style={styles.historySection}>
            <h3 style={styles.sectionHeading}>📜 Recibos y Comprobantes Anteriores</h3>
            <p style={styles.sectionDesc}>
              Historial de liquidaciones mensuales procesadas exitosamente por Stripe.
            </p>

            {history.length === 0 ? (
              <div style={styles.emptyHistory}>Aún no se han emitido recibos de pago.</div>
            ) : (
              <div style={styles.historyList}>
                {history.map((receipt) => (
                  <div key={receipt.id} style={styles.receiptItem}>
                    <div>
                      <strong style={{ display: 'block', color: '#27170e' }}>
                        Factura #{receipt.id} ({receipt.folio})
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: '#6b5c52' }}>
                        📅 {new Date(receipt.date).toLocaleDateString('es-MX')} • {receipt.ordersCount} pedidos liquidados
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={styles.receiptAmount}>{formatMoney(receipt.totalPaid)} MXN</span>
                      <button
                        type="button"
                        onClick={() => setSelectedReceiptForModal(receipt)}
                        style={styles.receiptDetailBtn}
                      >
                        Ver Detalle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Tabla Detallada de Pedidos Registrados */}
        <section style={styles.tableSection}>
          <div style={styles.tableHeaderRow}>
            <div>
              <h3 style={styles.sectionHeading}>📋 Registro de Comandas desde el Carrito de Compras</h3>
              <p style={styles.sectionDesc}>
                Cada pedido enviado por los clientes mediante el botón de WhatsApp se contabiliza aquí de forma
                inmutable.
              </p>
            </div>

            {/* Filtros */}
            <div style={styles.filterButtonGroup}>
              <button
                type="button"
                onClick={() => setOrdersFilter('all')}
                style={{
                  ...styles.filterBtn,
                  background: ordersFilter === 'all' ? '#c25428' : '#ffffff',
                  color: ordersFilter === 'all' ? '#ffffff' : '#27170e',
                }}
              >
                Todos ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setOrdersFilter('unpaid')}
                style={{
                  ...styles.filterBtn,
                  background: ordersFilter === 'unpaid' ? '#c25428' : '#ffffff',
                  color: ordersFilter === 'unpaid' ? '#ffffff' : '#27170e',
                }}
              >
                Pendientes ({summary?.unpaidOrdersCount || 0})
              </button>
              <button
                type="button"
                onClick={() => setOrdersFilter('paid')}
                style={{
                  ...styles.filterBtn,
                  background: ordersFilter === 'paid' ? '#c25428' : '#ffffff',
                  color: ordersFilter === 'paid' ? '#ffffff' : '#27170e',
                }}
              >
                Liquidados ({summary?.paidOrdersCount || 0})
              </button>
            </div>
          </div>

          <div style={styles.tableResponsive}>
            <table style={styles.ordersTable}>
              <thead>
                <tr>
                  <th style={styles.th}>Folio / ID</th>
                  <th style={styles.th}>Fecha & Hora</th>
                  <th style={styles.th}>Servicio</th>
                  <th style={styles.th}>Mesa / Cliente</th>
                  <th style={styles.th}>Venta Restaurante</th>
                  <th style={styles.th}>Comisión Plataforma</th>
                  <th style={styles.th}>Estatus Comisión</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                      No hay pedidos en este filtro.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong>#{ord.folio}</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#999' }}>{ord.id}</span>
                      </td>
                      <td style={styles.td}>
                        {new Date(ord.createdAt).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                        })}{' '}
                        •{' '}
                        {new Date(ord.createdAt).toLocaleTimeString('es-MX', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.orderTypeTag}>{ord.orderType}</span>
                      </td>
                      <td style={styles.td}>{ord.customerRef}</td>
                      <td style={styles.td}>
                        <strong>{formatMoney(ord.orderTotal)}</strong>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: 700, color: '#c25428' }}>
                          ${ord.commissionAmount || billingConfig.commissionPerOrder}.00 MXN
                        </span>
                      </td>
                      <td style={styles.td}>
                        {ord.paid ? (
                          <span style={styles.badgePaid}>✓ Liquidado ({ord.paymentId})</span>
                        ) : (
                          <span style={styles.badgePending}>⏳ Pendiente de Pago</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modal de Detalle de Recibo de Pago */}
      {selectedReceiptForModal && (
        <div style={styles.modalOverlay} onClick={() => setSelectedReceiptForModal(null)}>
          <div style={styles.receiptModalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#27170e' }}>
                📄 Comprobante de Liquidación Stripe
              </h3>
              <button
                type="button"
                onClick={() => setSelectedReceiptForModal(null)}
                style={styles.modalCloseBtn}
              >
                ✕
              </button>
            </div>

            <div style={styles.receiptModalBody}>
              <div style={styles.receiptWatermarkBox}>
                <span style={{ fontSize: '0.85rem', color: '#c25428', fontWeight: 800 }}>REDAYSOFT PLATFORM</span>
                <h2 style={{ margin: '0.2rem 0', fontSize: '1.5rem', color: '#27170e' }}>
                  Recibo de Liquidación
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#666' }}>
                  Folio Fiscal: <strong>{selectedReceiptForModal.folio}</strong>
                </span>
              </div>

              <div style={styles.receiptGrid}>
                <div>
                  <span style={styles.receiptMetaLabel}>Cliente / Establecimiento:</span>
                  <p style={styles.receiptMetaVal}>{BUSINESS_DATA.brand?.name || 'Cafetería María Bonita'}</p>
                </div>
                <div>
                  <span style={styles.receiptMetaLabel}>Fecha de Operación:</span>
                  <p style={styles.receiptMetaVal}>
                    {new Date(selectedReceiptForModal.date).toLocaleString('es-MX')}
                  </p>
                </div>
                <div>
                  <span style={styles.receiptMetaLabel}>Método de Pago:</span>
                  <p style={styles.receiptMetaVal}>{selectedReceiptForModal.paymentMethod}</p>
                </div>
                <div>
                  <span style={styles.receiptMetaLabel}>Comprobante:</span>
                  <p style={styles.receiptMetaVal}>{selectedReceiptForModal.id}</p>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '1rem 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Comisiones por pedido ({selectedReceiptForModal.ordersCount} comandas x ${selectedReceiptForModal.commissionPerOrder}.00 MXN):</span>
                <strong>{formatMoney(selectedReceiptForModal.totalPaid)} MXN</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Impuesto IVA (16% incluido):</span>
                <span>{formatMoney((selectedReceiptForModal.totalPaid * 0.16) / 1.16)} MXN</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '2px solid #27170e',
                  fontSize: '1.2rem',
                }}
              >
                <strong>Total Pagado:</strong>
                <strong style={{ color: '#c25428' }}>{formatMoney(selectedReceiptForModal.totalPaid)} MXN</strong>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={() => window.print()}
                style={styles.printBtn}
              >
                🖨️ Imprimir Recibo
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceiptForModal(null)}
                style={styles.closeModalBtn}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos limpios y profesionales
const styles = {
  authContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1f120a 0%, #3d2315 100%)',
    padding: '1.5rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  authCard: {
    background: '#ffffff',
    borderRadius: '20px',
    maxWidth: '440px',
    width: '100%',
    padding: '2.5rem 2rem',
    boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
    textAlign: 'center',
  },
  authIconWrap: {
    width: '64px',
    height: '64px',
    background: '#fef3e7',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    marginBottom: '1rem',
  },
  authKicker: {
    display: 'block',
    fontSize: '0.75rem',
    letterSpacing: '0.12em',
    fontWeight: 800,
    color: '#c25428',
    marginBottom: '0.4rem',
  },
  authTitle: {
    fontSize: '1.5rem',
    color: '#1f120a',
    margin: '0 0 0.5rem 0',
    fontWeight: 800,
  },
  authSubtitle: {
    fontSize: '0.88rem',
    color: '#6b5c52',
    lineHeight: 1.5,
    marginBottom: '1.75rem',
  },
  authForm: {
    textAlign: 'left',
  },
  authLabel: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#27170e',
    marginBottom: '0.5rem',
  },
  authInput: {
    width: '100%',
    padding: '0.85rem 1rem',
    fontSize: '1.15rem',
    borderRadius: '10px',
    border: '2px solid #d1c7bc',
    textAlign: 'center',
    letterSpacing: '0.3em',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '0.5rem',
  },
  authErrorMsg: {
    fontSize: '0.78rem',
    color: '#dc2626',
    margin: '0 0 1rem 0',
    lineHeight: 1.4,
  },
  authSubmitBtn: {
    width: '100%',
    padding: '0.9rem',
    background: '#c25428',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '0.75rem',
    transition: 'background 0.2s',
  },
  authFooter: {
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f0eae4',
  },
  authBackLink: {
    fontSize: '0.85rem',
    color: '#6b5c52',
    textDecoration: 'none',
    fontWeight: 600,
  },

  // Dashboard
  dashboardContainer: {
    minHeight: '100vh',
    background: '#fdfbf7',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#27170e',
  },
  headerBar: {
    background: '#ffffff',
    borderBottom: '1px solid #eee7df',
    padding: '1rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
  },
  brandBadge: {
    fontSize: '1.1rem',
    color: '#27170e',
  },
  headerDivider: {
    color: '#d1c7bc',
  },
  headerPortalTag: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#c25428',
    background: '#fef3e7',
    padding: '0.25rem 0.65rem',
    borderRadius: '9999px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  viewMenuBtn: {
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#27170e',
    background: '#f4ece4',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #d1c7bc',
    color: '#6b5c52',
    padding: '0.5rem 0.9rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  welcomeBanner: {
    background: '#ffffff',
    border: '1px solid #eee7df',
    borderRadius: '16px',
    padding: '1.75rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 20px rgba(50,25,12,0.04)',
  },
  bannerTitle: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#1f120a',
    fontWeight: 800,
  },
  bannerSubtitle: {
    margin: '0.4rem 0 0 0',
    color: '#6b5c52',
    fontSize: '0.925rem',
  },
  demoOrderBtn: {
    background: '#1f120a',
    color: '#ffffff',
    border: 'none',
    padding: '0.7rem 1.2rem',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#ffffff',
    border: '1px solid #eee7df',
    borderRadius: '14px',
    padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  statLabel: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: '#6b5c52',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statIcon: {
    fontSize: '1.25rem',
  },
  statMainValue: {
    fontSize: '1.9rem',
    fontWeight: 800,
    color: '#1f120a',
    marginBottom: '0.35rem',
  },
  statSubtext: {
    fontSize: '0.78rem',
    color: '#8b7c72',
    lineHeight: 1.4,
  },
  progressBarBg: {
    height: '6px',
    background: '#eee7df',
    borderRadius: '9999px',
    marginTop: '0.75rem',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.3s ease',
  },
  successAlert: {
    background: '#ecfdf5',
    border: '1px solid #86efac',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '2rem',
  },
  viewReceiptBtn: {
    background: '#15803d',
    color: '#ffffff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  twoColLayout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2.5rem',
  },
  stripeCardSection: {
    background: '#ffffff',
    border: '1px solid #eee7df',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(50,25,12,0.04)',
  },
  sectionHeaderStripe: {
    background: '#635bff',
    color: '#ffffff',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stripeLogoText: {
    fontSize: '1.6rem',
    fontWeight: 800,
    letterSpacing: '-0.04em',
  },
  stripeSubTag: {
    fontSize: '0.78rem',
    background: 'rgba(255,255,255,0.2)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    marginLeft: '0.4rem',
  },
  sslBadge: {
    fontSize: '0.75rem',
    opacity: 0.9,
  },
  stripeBody: {
    padding: '1.75rem 1.5rem',
  },
  amountBreakdown: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '1.2rem',
    border: '1px solid #e2e8f0',
    marginBottom: '1.5rem',
  },
  amountLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.88rem',
    color: '#475569',
    marginBottom: '0.5rem',
  },
  amountLineTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '1.1rem',
    fontWeight: 800,
    color: '#0f172a',
    paddingTop: '0.75rem',
    borderTop: '1px solid #cbd5e1',
    marginTop: '0.5rem',
  },
  totalAccent: {
    color: '#635bff',
    fontSize: '1.35rem',
  },
  paymentForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  formLabel: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#475569',
  },
  formInput: {
    padding: '0.75rem 0.9rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.925rem',
    boxSizing: 'border-box',
    outline: 'none',
  },
  payButton: {
    marginTop: '0.5rem',
    background: 'linear-gradient(135deg, #635bff 0%, #4338ca 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '1rem',
    fontSize: '1rem',
    fontWeight: 700,
    boxShadow: '0 4px 15px rgba(99,91,255,0.3)',
  },
  stripeNote: {
    fontSize: '0.78rem',
    color: '#64748b',
    marginTop: '1.25rem',
    lineHeight: 1.5,
    borderTop: '1px solid #f1f5f9',
    paddingTop: '0.75rem',
  },
  historySection: {
    background: '#ffffff',
    border: '1px solid #eee7df',
    borderRadius: '16px',
    padding: '1.75rem 1.5rem',
    boxShadow: '0 4px 20px rgba(50,25,12,0.04)',
  },
  sectionHeading: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#1f120a',
    margin: '0 0 0.35rem 0',
  },
  sectionDesc: {
    fontSize: '0.85rem',
    color: '#6b5c52',
    margin: '0 0 1.25rem 0',
  },
  emptyHistory: {
    padding: '2rem',
    textAlign: 'center',
    color: '#999',
    fontSize: '0.9rem',
    background: '#fbf8f5',
    borderRadius: '10px',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  receiptItem: {
    background: '#fdfbf7',
    border: '1px solid #eee7df',
    borderRadius: '10px',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receiptAmount: {
    display: 'block',
    fontWeight: 800,
    color: '#15803d',
    fontSize: '1rem',
  },
  receiptDetailBtn: {
    background: 'transparent',
    border: 'none',
    color: '#c25428',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
    padding: 0,
    marginTop: '0.2rem',
  },
  tableSection: {
    background: '#ffffff',
    border: '1px solid #eee7df',
    borderRadius: '16px',
    padding: '1.75rem 1.5rem',
    boxShadow: '0 4px 20px rgba(50,25,12,0.04)',
  },
  tableHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.25rem',
  },
  filterButtonGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  filterBtn: {
    border: '1px solid #eee7df',
    borderRadius: '8px',
    padding: '0.4rem 0.85rem',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  ordersTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.85rem',
  },
  th: {
    padding: '0.75rem 1rem',
    background: '#f8f4ee',
    color: '#6b5c52',
    fontWeight: 700,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #eee7df',
  },
  tr: {
    borderBottom: '1px solid #f4ece4',
  },
  td: {
    padding: '0.9rem 1rem',
    verticalAlign: 'middle',
  },
  orderTypeTag: {
    background: '#f4ece4',
    padding: '0.25rem 0.55rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  badgePaid: {
    background: '#dcfce7',
    color: '#166534',
    fontWeight: 700,
    fontSize: '0.75rem',
    padding: '0.25rem 0.65rem',
    borderRadius: '9999px',
  },
  badgePending: {
    background: '#fef3c7',
    color: '#92400e',
    fontWeight: 700,
    fontSize: '0.75rem',
    padding: '0.25rem 0.65rem',
    borderRadius: '9999px',
  },

  // Modal Recibo
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '1rem',
  },
  receiptModalCard: {
    background: '#ffffff',
    borderRadius: '16px',
    maxWidth: '520px',
    width: '100%',
    boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalCloseBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
  },
  receiptModalBody: {
    padding: '1.75rem 1.5rem',
  },
  receiptWatermarkBox: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px dashed #d1c7bc',
  },
  receiptGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    fontSize: '0.85rem',
  },
  receiptMetaLabel: {
    display: 'block',
    color: '#888',
    fontSize: '0.75rem',
  },
  receiptMetaVal: {
    margin: '0.2rem 0 0 0',
    fontWeight: 700,
    color: '#27170e',
  },
  modalFooter: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #eee',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    background: '#fafafa',
  },
  printBtn: {
    background: '#c25428',
    color: '#ffffff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  closeModalBtn: {
    background: '#e5e7eb',
    color: '#374151',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
};
