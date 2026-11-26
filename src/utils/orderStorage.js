import billingData from '../../data/billing.json';

const ORDERS_KEY = 'mb_restaurant_orders';
const BILLING_HISTORY_KEY = 'mb_restaurant_billing_history';

// Configuración por defecto
const getPlatformBillingConfig = () => {
  return (
    billingData || {
      monthlyFee: 300,
      commissionPerOrder: 0,
      currency: 'MXN',
      cycleDays: 30,
      ownerPin: '2026',
      stripePublishableKey: 'pk_test_TYooMQauvdEDq54NiTphI7jx',
      companyName: 'RedaySoft Soluciones Digitales',
      supportEmail: 'soporte@redaysoft.com',
    }
  );
};

// Semilla inicial realista de pedidos para que el panel no inicie vacío al probarlo
function getInitialSeedOrders(commissionRate) {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  return [
    {
      id: 'ORD-A91X',
      folio: 1042,
      createdAt: new Date(now - dayMs * 18).toISOString(),
      orderType: 'Mesa',
      customerRef: 'Mesa 4',
      itemsCount: 3,
      orderTotal: 295,
      commissionAmount: commissionRate,
      paid: true,
      paymentId: 'STRIPE-TXN-8841',
      paidAt: new Date(now - dayMs * 15).toISOString(),
    },
    {
      id: 'ORD-B42K',
      folio: 1043,
      createdAt: new Date(now - dayMs * 16).toISOString(),
      orderType: 'Para Llevar',
      customerRef: 'Carlos Mendoza',
      itemsCount: 2,
      orderTotal: 184,
      commissionAmount: commissionRate,
      paid: true,
      paymentId: 'STRIPE-TXN-8841',
      paidAt: new Date(now - dayMs * 15).toISOString(),
    },
    {
      id: 'ORD-C73M',
      folio: 1044,
      createdAt: new Date(now - dayMs * 8).toISOString(),
      orderType: 'Mesa',
      customerRef: 'Mesa 2',
      itemsCount: 4,
      orderTotal: 465,
      commissionAmount: commissionRate,
      paid: false,
      paymentId: null,
      paidAt: null,
    },
    {
      id: 'ORD-D85P',
      folio: 1045,
      createdAt: new Date(now - dayMs * 5).toISOString(),
      orderType: 'Para Llevar',
      customerRef: 'Mariana Ríos',
      itemsCount: 2,
      orderTotal: 198,
      commissionAmount: commissionRate,
      paid: false,
      paymentId: null,
      paidAt: null,
    },
    {
      id: 'ORD-E19Q',
      folio: 1046,
      createdAt: new Date(now - dayMs * 2).toISOString(),
      orderType: 'Mesa',
      customerRef: 'Terraza 1',
      itemsCount: 5,
      orderTotal: 580,
      commissionAmount: commissionRate,
      paid: false,
      paymentId: null,
      paidAt: null,
    },
    {
      id: 'ORD-F33R',
      folio: 1047,
      createdAt: new Date(now - 1000 * 60 * 120).toISOString(),
      orderType: 'Mesa',
      customerRef: 'Mesa 6',
      itemsCount: 3,
      orderTotal: 340,
      commissionAmount: commissionRate,
      paid: false,
      paymentId: null,
      paidAt: null,
    },
  ];
}

// Historial inicial de pagos mensuales
function getInitialSeedHistory() {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  return [
    {
      id: 'REC-2026-001',
      folio: 'SPEI-8841-MB',
      date: new Date(now - dayMs * 15).toISOString(),
      period: 'Periodo 28 Octubre 2026 - 28 Noviembre 2026',
      concept: 'Cuota Mensual Mantenimiento & Menú Digital',
      ordersCount: 18,
      totalPaid: 300,
      currency: 'MXN',
      paymentMethod: 'Transferencia Interbancaria SPEI (BBVA)',
      reference: 'MARIA-BONITA-01',
      status: 'Aprobado y Liquidado',
      company: 'RedaySoft Soluciones Digitales',
      restaurant: 'Cafetería María Bonita',
    },
  ];
}

/**
 * Obtener todos los pedidos registrados
 */
export function getStoredOrders() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) {
      const config = getPlatformBillingConfig();
      const initial = getInitialSeedOrders(config.commissionPerOrder || 3);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored orders:', e);
    return [];
  }
}

/**
 * Registrar un nuevo pedido generado desde el carrito de compras
 */
export function recordNewOrder({ orderType, customerRef, paymentMethod, tableOrName, items = [], total = 0 }) {
  if (typeof window === 'undefined') return null;

  try {
    const orders = getStoredOrders();
    const config = getPlatformBillingConfig();
    const commission = Number(config.commissionPerOrder) || 3;

    let normalizedType = 'Pasar a Buscar';
    if (orderType === 'delivery' || orderType === 'A Domicilio') normalizedType = 'A Domicilio';
    else if (orderType === 'pickup' || orderType === 'Pasar a Buscar') normalizedType = 'Pasar a Buscar';
    else if (orderType === 'mesa') normalizedType = 'Mesa';
    else if (orderType) normalizedType = orderType;

    const newOrder = {
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      folio: 1048 + orders.length,
      createdAt: new Date().toISOString(),
      orderType: normalizedType,
      customerRef: customerRef?.trim() || tableOrName?.trim() || 'Sin especificar',
      paymentMethod: paymentMethod === 'Transferencia' ? 'Transferencia' : 'Efectivo',
      itemsCount: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
      itemsSummary: items.map((i) => `${i.quantity}x ${i.name}`).join(', '),
      orderTotal: Number(total) || 0,
      commissionAmount: commission,
      paid: false,
      paymentId: null,
      paidAt: null,
    };

    orders.unshift(newOrder);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    // Disparar evento para que cualquier vista abierta del panel se actualice en tiempo real
    window.dispatchEvent(new CustomEvent('mb_order_recorded', { detail: newOrder }));

    return newOrder;
  } catch (e) {
    console.error('Error saving order:', e);
    return null;
  }
}

/**
 * Obtener el resumen de suscripción mensual y métricas para el dueño
 */
export function getBillingSummary() {
  const orders = getStoredOrders();
  const config = getPlatformBillingConfig();
  const monthlyFee = Number(config.monthlyFee) || 300;
  const cycleDays = Number(config.cycleDays) || 30;
  const history = getBillingHistory();
  const totalPaidHistory = history.reduce((sum, r) => sum + (Number(r.totalPaid) || 0), 0);

  return {
    totalOrdersCount: orders.length,
    monthlyFee,
    currency: config.currency || 'MXN',
    historyCount: history.length,
    totalPaidHistory,
    cycleDays,
    companyName: config.companyName || 'RedaySoft Soluciones Digitales',
    supportEmail: config.supportEmail || 'soporte@redaysoft.com',
  };
}

/**
 * Registrar un nuevo pago mensual de la plataforma
 */
export function recordMonthlyPayment({
  amount = 300,
  paymentMethod = 'Transferencia Interbancaria SPEI (BBVA)',
  reference = 'MARIA-BONITA-01',
  period = '',
} = {}) {
  if (typeof window === 'undefined') return null;
  try {
    const history = getBillingHistory();
    const invoiceNumber = `REC-2026-${String(history.length + 1).padStart(3, '0')}`;
    const folio = `SPEI-${Date.now().toString(36).toUpperCase()}-MB`;
    const newReceipt = {
      id: invoiceNumber,
      folio,
      date: new Date().toISOString(),
      period: period || `Membresía Mensual (+30 Días - ${new Date().toLocaleDateString('es-MX')})`,
      concept: 'Cuota Mensual Mantenimiento & Menú Digital',
      totalPaid: Number(amount) || 300,
      currency: 'MXN',
      paymentMethod,
      reference,
      status: 'Aprobado y Liquidado',
      company: 'RedaySoft Soluciones Digitales',
      restaurant: 'Cafetería María Bonita',
    };
    history.unshift(newReceipt);
    localStorage.setItem(BILLING_HISTORY_KEY, JSON.stringify(history));
    window.dispatchEvent(new CustomEvent('mb_billing_updated'));
    return newReceipt;
  } catch (e) {
    console.error('Error recording monthly payment:', e);
    return null;
  }
}

/**
 * Obtener historial de facturas y liquidaciones
 */
export function getBillingHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BILLING_HISTORY_KEY);
    if (!raw) {
      const initial = getInitialSeedHistory();
      localStorage.setItem(BILLING_HISTORY_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading billing history:', e);
    return [];
  }
}

/**
 * Procesar liquidación a través de Stripe (Simulado y listo para credenciales de producción)
 */
export function processStripePayment({ paymentMethod = 'Tarjeta de Crédito Stripe', last4 = '4242' } = {}) {
  if (typeof window === 'undefined') return { success: false };

  try {
    const orders = getStoredOrders();
    const config = getPlatformBillingConfig();
    const unpaidOrders = orders.filter((o) => !o.paid);

    if (unpaidOrders.length === 0) {
      return { success: false, message: 'No hay comisiones pendientes por liquidar.' };
    }

    const commissionRate = Number(config.commissionPerOrder) || 3;
    const totalAmount = unpaidOrders.reduce((sum, o) => sum + (Number(o.commissionAmount) || commissionRate), 0);

    const paymentId = `STRIPE-${Date.now().toString(36).toUpperCase()}`;
    const paidAt = new Date().toISOString();

    // Actualizar pedidos a pagados
    const updatedOrders = orders.map((order) => {
      if (!order.paid) {
        return {
          ...order,
          paid: true,
          paymentId,
          paidAt,
        };
      }
      return order;
    });

    localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));

    // Registrar en historial de facturación
    const history = getBillingHistory();
    const invoiceNumber = `REC-${new Date().getFullYear()}-${String(history.length + 1).padStart(3, '0')}`;

    const newReceipt = {
      id: invoiceNumber,
      folio: paymentId,
      date: paidAt,
      ordersCount: unpaidOrders.length,
      commissionPerOrder: commissionRate,
      totalPaid: totalAmount,
      currency: config.currency || 'MXN',
      paymentMethod: `${paymentMethod} (•••• ${last4})`,
      status: 'Aprobado y Liquidado',
      company: config.companyName,
    };

    history.unshift(newReceipt);
    localStorage.setItem(BILLING_HISTORY_KEY, JSON.stringify(history));

    window.dispatchEvent(new CustomEvent('mb_billing_updated'));

    return {
      success: true,
      receipt: newReceipt,
      amount: totalAmount,
    };
  } catch (e) {
    console.error('Error processing Stripe payment:', e);
    return { success: false, message: e.message };
  }
}

/**
 * Generar pedido de prueba para verificar cómo se contabiliza
 */
export function addMockOrder() {
  const types = ['Mesa', 'Para Llevar'];
  const refs = ['Mesa 1', 'Mesa 5', 'Mesa 8', 'Para recoger (Ana)', 'Terraza 2'];
  const totals = [145, 230, 310, 420, 185, 520];

  return recordNewOrder({
    orderType: types[Math.floor(Math.random() * types.length)],
    tableOrName: refs[Math.floor(Math.random() * refs.length)],
    items: [
      { name: 'Frappé de Mazapán María Bonita', quantity: 1 },
      { name: 'Chilaquiles Mestizos', quantity: 1 },
    ],
    total: totals[Math.floor(Math.random() * totals.length)],
  });
}
