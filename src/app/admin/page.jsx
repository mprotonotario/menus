'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useMenuData } from '../../context/MenuDataContext';
import billingData from '../../../data/billing.json';
import brandData from '../../../data/brand.json';
import locationData from '../../../data/location.json';
import contactData from '../../../data/contact.json';
import { formatMoney } from '../../utils/formatUtils';
import {
  getStoredOrders,
  getBillingSummary,
  getBillingHistory,
  recordMonthlyPayment,
} from '../../utils/orderStorage';
import {
  evaluateBillingStatus,
  renewBillingCycle,
  setPlatformSuspension,
  generateWhatsappReminderMessage,
} from '../../lib/billingStatus';
import { REDAYSOFT_BADGE_BASE64 } from '../../assets/logoBase64';

export default function AdminBillingPage() {
  const { businessData } = useMenuData();
  const billingConfig = businessData?.platformBilling || billingData || {
    commissionPerOrder: 0,
    monthlyFee: 300,
    currency: 'MXN',
    cycleDays: 30,
    ownerPin: '2026',
    companyName: 'RedaySoft Soluciones Digitales',
    supportEmail: 'soporte@redaysoft.com',
  };

  // Autenticación de dueño por PIN
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Datos de facturación y pedidos
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [ordersFilter, setOrdersFilter] = useState('all'); // 'all' | 'mesa' | 'llevar'
  const [subStatus, setSubStatus] = useState(null);

  // Monitor de Visitantes por IP & Dispositivo
  const [visitorStats, setVisitorStats] = useState(null);
  const [visitorsFilter, setVisitorsFilter] = useState('all'); // 'all' | 'mobile' | 'desktop'
  const [isLoadingVisitors, setIsLoadingVisitors] = useState(false);

  // Menú de Navegación de Secciones en el Panel de Administración
  const [activeAdminTab, setActiveAdminTab] = useState('all'); // 'all' | 'orders' | 'visitors' | 'billing' | 'receipts'

  // Salto con scroll suave a una sección específica
  const scrollToSection = (sectionId) => {
    if (typeof document !== 'undefined') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Modales y Feedback
  const [selectedReceiptForModal, setSelectedReceiptForModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

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

  // Escuchar eventos de nuevos pedidos y pagos
  useEffect(() => {
    const handleOrderChange = () => refreshData();
    window.addEventListener('mb_order_recorded', handleOrderChange);
    window.addEventListener('mb_billing_updated', handleOrderChange);
    return () => {
      window.removeEventListener('mb_order_recorded', handleOrderChange);
      window.removeEventListener('mb_billing_updated', handleOrderChange);
    };
  }, []);

  const refreshData = async () => {
    setSummary(getBillingSummary());
    setOrders(getStoredOrders());
    setHistory(getBillingHistory());

    // Cargar estadísticas de visitantes desde logs/visitors.log
    try {
      const vRes = await fetch('/api/visitors/record?stats=true', { cache: 'no-store' }).then((r) => r.json());
      if (vRes?.success && vRes.stats) {
        setVisitorStats(vRes.stats);
      }
    } catch (e) {
      console.warn('Error reading visitors stats:', e);
    }

    try {
      const res = await fetch('/api/billing/status', { cache: 'no-store' }).then((r) => r.json());
      if (res?.success && res.billingStatus) {
        setSubStatus(res.billingStatus);
        return;
      }
    } catch (e) {
      console.warn('Error reading /api/billing/status:', e);
    }
    setSubStatus(evaluateBillingStatus());
  };

  const handleRefreshVisitors = async () => {
    setIsLoadingVisitors(true);
    try {
      const vRes = await fetch('/api/visitors/record?stats=true', { cache: 'no-store' }).then((r) => r.json());
      if (vRes?.success && vRes.stats) {
        setVisitorStats(vRes.stats);
        showFeedbackToast('success', 'Bitácora de Visitantes Actualizada', 'Se han cargado los accesos más recientes de logs/visitors.log.');
      }
    } catch (err) {
      showFeedbackToast('error', 'Error al consultar log', err.message);
    } finally {
      setIsLoadingVisitors(false);
    }
  };

  const showFeedbackToast = (type, title, message) => {
    setFeedbackToast({ type, title, message });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4500);
  };

  const handleCopy = (text, fieldName) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const printReceiptDocument = (receipt) => {
    if (typeof window === 'undefined' || !receipt) return;

    const total = receipt.totalPaid || monthlyFee || 300;
    const dateFormatted = new Date(receipt.date || Date.now()).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const printContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Comprobante de Mensualidad - ${receipt.id || 'REC-2026'}</title>
  <style>
    @page {
      size: letter portrait;
      margin: 10mm 14mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background: #ffffff;
      color: #1f2937;
      padding: 10px 14px;
      font-size: 13px;
      line-height: 1.45;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .header-table {
      width: 100%;
      border-bottom: 2.5px solid #c25428;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      color: #c25428;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 11px;
      color: #4b5563;
      margin-top: 2px;
    }
    .receipt-badge-title {
      font-size: 18px;
      font-weight: 800;
      color: #1f2937;
      text-align: right;
    }
    .receipt-meta-box {
      text-align: right;
      font-size: 12px;
      color: #4b5563;
      margin-top: 4px;
    }
    .status-stamp {
      display: inline-block;
      margin-top: 6px;
      padding: 4px 12px;
      background: #dcfce7;
      border: 1.5px solid #16a34a;
      color: #15803d;
      font-size: 11px;
      font-weight: 800;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-grid {
      display: table;
      width: 100%;
      margin-bottom: 16px;
    }
    .info-col {
      display: table-cell;
      width: 50%;
      vertical-align: top;
      background: #faf7f2;
      padding: 12px 14px;
      border-radius: 8px;
      border: 1px solid #ebd9c5;
    }
    .info-col:first-child {
      border-right: 6px solid #ffffff;
    }
    .info-heading {
      font-size: 11px;
      font-weight: 800;
      color: #8c5936;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      border-bottom: 1px solid #ebd9c5;
      padding-bottom: 4px;
    }
    .info-line {
      font-size: 12px;
      margin-bottom: 3px;
      color: #374151;
    }
    .info-line strong {
      color: #111827;
    }
    .table-concept {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    .table-concept th {
      background: #27170e;
      color: #ffffff;
      padding: 8px 10px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: left;
    }
    .table-concept td {
      padding: 12px 10px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 12px;
      vertical-align: top;
    }
    .concept-title {
      font-weight: 700;
      color: #111827;
      font-size: 13px;
    }
    .concept-desc {
      color: #4b5563;
      font-size: 11px;
      margin-top: 4px;
      line-height: 1.45;
    }
    .totals-area {
      display: table;
      width: 100%;
      margin-bottom: 16px;
    }
    .totals-left {
      display: table-cell;
      width: 55%;
      vertical-align: top;
      padding-right: 15px;
    }
    .totals-right {
      display: table-cell;
      width: 45%;
      vertical-align: top;
    }
    .totals-table {
      width: 100%;
      border-collapse: collapse;
    }
    .totals-table td {
      padding: 5px 8px;
      font-size: 12px;
    }
    .total-row {
      border-top: 2px solid #27170e;
      border-bottom: 2px solid #27170e;
      font-size: 15px !important;
      font-weight: 800;
      color: #c25428;
      background: #faf7f2;
    }
    .amount-words-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 11px;
      color: #4b5563;
      margin-bottom: 10px;
    }
    .spei-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 11px;
      color: #166534;
    }
    .digital-seal-box {
      border-top: 1px dashed #d1d5db;
      padding-top: 10px;
      margin-top: 12px;
      font-size: 9.5px;
      color: #6b7280;
      line-height: 1.35;
    }
    .footer-note {
      text-align: center;
      margin-top: 14px;
      font-size: 10px;
      color: #9ca3af;
      border-top: 1px solid #f3f4f6;
      padding-top: 8px;
    }
  </style>
</head>
<body>
  <!-- Encabezado Oficial -->
  <table class="header-table">
    <tr>
      <td style="vertical-align: middle;">
        <div style="margin-bottom: 6px;">
          <img src="${REDAYSOFT_BADGE_BASE64}" alt="RedaySoft" style="height: 54px; width: auto; display: block; object-fit: contain;" />
        </div>
        <div style="font-weight: 700; color: #27170e; font-size: 13px;">Soluciones Digitales</div>
        <div class="brand-sub">Plataforma Cloud & Menús Digitales Interactivos</div>
        <div class="brand-sub">Atención & Soporte: soporte@redaysoft.com • Cancún / Chetumal, Q. Roo</div>
      </td>
      <td style="vertical-align: middle; text-align: right;">
        <div class="receipt-badge-title">COMPROBANTE DE SUSCRIPCIÓN</div>
        <div class="receipt-meta-box">
          <div>Número de Recibo: <strong>#${receipt.id || 'REC-2026-001'}</strong></div>
          <div>Referencia Operación: <strong>${receipt.folio || 'SPEI-8841-MB'}</strong></div>
          <div>Fecha de Emisión: <strong>${dateFormatted}</strong></div>
        </div>
        <div>
          <span class="status-stamp">✓ ${receipt.status || 'ACTIVO & PAGADO'}</span>
        </div>
      </td>
    </tr>
  </table>

  <!-- Bloque Emisor / Receptor -->
  <div class="info-grid">
    <div class="info-col">
      <div class="info-heading">DATOS DEL ESTABLECIMIENTO / CLIENTE</div>
      <div class="info-line">Establecimiento: <strong>${businessData?.brand?.name || brandData.brand?.name || 'Cafetería Demo'}</strong></div>
      <div class="info-line">Razón Comercial: <strong>${businessData?.tradeName || brandData.tradeName || 'Cafetería Demo • Menú Digital'}</strong></div>
      <div class="info-line">Dirección: <strong>${businessData?.location?.address || locationData.location?.address || 'Av. Álvaro Obregón #168, Col. Centro'}</strong></div>
      <div class="info-line">Ciudad: <strong>${businessData?.location?.cityZone || locationData.location?.cityZone || '77000 Chetumal, Quintana Roo'}</strong></div>
      <div class="info-line">Teléfono / WhatsApp: <strong>+${businessData?.contact?.whatsappRaw || contactData.contact?.whatsappRaw || '529831226847'}</strong></div>
    </div>
    <div class="info-col">
      <div class="info-heading">DATOS DE LA LIQUIDACIÓN</div>
      <div class="info-line">Modalidad de Pago: <strong>${receipt.paymentMethod || 'Transferencia Interbancaria SPEI (BBVA)'}</strong></div>
      <div class="info-line">Referencia Registrada: <strong>${receipt.reference || 'MARIA-BONITA-01'}</strong></div>
      <div class="info-line">Banco Receptor: <strong>BBVA México</strong></div>
      <div class="info-line">Cuenta CLABE: <strong>012180001234567890</strong></div>
      <div class="info-line">Moneda: <strong>MXN (Pesos Mexicanos)</strong></div>
    </div>
  </div>

  <!-- Tabla de Conceptos Detallada -->
  <table class="table-concept">
    <thead>
      <tr>
        <th style="width: 8%; text-align: center;">CANT.</th>
        <th style="width: 54%;">DESCRIPCIÓN DEL SERVICIO CONTRATADO</th>
        <th style="width: 18%; text-align: right;">PRECIO UNITARIO</th>
        <th style="width: 20%; text-align: right;">IMPORTE NETO</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center; font-weight: 700;">1 Mes</td>
        <td>
          <div class="concept-title">Membresía Mensual - Plataforma Menú Digital ${businessData?.brand?.name || brandData.brand?.name || 'Cafetería Demo'}</div>
          <div class="concept-desc">
            • Servicio de Menú Digital interactivo en la nube disponible 24/7 para comensales en salón y pedidos para llevar.<br>
            • Recepción ilimitada de comandas automáticas estructuradas directamente a WhatsApp del restaurante.<br>
            • Panel de control administrativo, catálogo dinámico en tiempo real y soporte técnico continuo.<br>
            • <strong>Periodo de Cobertura:</strong> ${receipt.period || 'Membresía Mensual Activa (+30 Días de Servicio)'}.
          </div>
        </td>
        <td style="text-align: right; font-weight: 600;">$${Number(total).toFixed(2)} MXN</td>
        <td style="text-align: right; font-weight: 700; color: #111827;">$${Number(total).toFixed(2)} MXN</td>
      </tr>
    </tbody>
  </table>

  <!-- Totales y Resumen -->
  <div class="totals-area">
    <div class="totals-left">
      <div class="amount-words-box">
        <strong>Importe en Letra:</strong><br>
        Trescientos pesos 00/100 M.N.
      </div>
      <div class="spei-box">
        <strong>✓ Acreditación Bancaria Confirmada:</strong><br>
        Pago mensual cubierto vía transferencia electrónica SPEI. Sin adeudos ni cobro de comisión por pedidos.
      </div>
    </div>
    <div class="totals-right">
      <table class="totals-table">
        <tr>
          <td style="color: #4b5563;">Cuota Mensual del Servicio:</td>
          <td style="text-align: right; font-weight: 600;">$${Number(total).toFixed(2)} MXN</td>
        </tr>
        <tr>
          <td style="color: #4b5563;">Cargos extra por pedidos:</td>
          <td style="text-align: right; font-weight: 600; color: #16a34a;">$0.00 MXN (Incluido)</td>
        </tr>
        <tr class="total-row">
          <td>TOTAL CUBIERTO:</td>
          <td style="text-align: right;">$${Number(total).toFixed(2)} MXN</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Póliza de Continuidad y Garantía de Servicio (No fiscal, ejecutivo y profesional) -->
  <div style="background: #fbf9f6; border: 1px solid #ebd9c5; border-radius: 8px; padding: 12px 14px; margin-top: 14px;">
    <div style="display: table; width: 100%;">
      <div style="display: table-cell; width: 68%; vertical-align: middle;">
        <div style="font-weight: 800; color: #27170e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">
          🛡️ Póliza de Continuidad y Soporte de Plataforma
        </div>
        <div style="font-size: 10.5px; color: #4b5563; line-height: 1.4;">
          El Menú Digital interactivo y el canal de recepción de comandas por WhatsApp cuentan con disponibilidad garantizada 24/7 y respaldo cloud durante el periodo cubierto.
        </div>
      </div>
      <div style="display: table-cell; width: 32%; text-align: right; vertical-align: middle;">
        <div style="display: inline-block; background: #ffffff; border: 1px solid #d1c7bc; border-radius: 6px; padding: 6px 10px; text-align: center;">
          <div style="font-size: 8px; color: #8c5936; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">CÓDIGO DE ACTIVACIÓN</div>
          <div style="font-family: monospace; font-size: 11px; font-weight: 700; color: #15803d; letter-spacing: 0.5px;">RS-ACT-${receipt.id || '2026-001'}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer-note">
    Gracias por tu preferencia. Este comprobante avala la cobertura mensual del servicio de Menú Digital contratado para <strong>${businessData?.brand?.name || brandData.brand?.name || 'Cafetería Demo'}</strong>. Soporte técnico y atención personalizada: <strong>soporte@redaysoft.com</strong> • WhatsApp: <strong>+52 983 122 6847</strong>.
  </div>
</body>
</html>
    `;

    // Crear iframe oculto para impresión aislada en exactamente 1 sola hoja
    const existingIframe = document.getElementById('print-receipt-frame');
    if (existingIframe) existingIframe.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'print-receipt-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(printContent);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => {
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 1500);
    }, 400);
  };

  const handleRenewCycle = () => {
    const fee = subStatus?.monthlyFee || billingConfig.monthlyFee || 300;
    setConfirmModal({
      icon: '🔄',
      iconBg: '#dcfce7',
      iconColor: '#16a34a',
      iconBorder: '#bbf7d0',
      iconShadow: 'rgba(22, 163, 74, 0.25)',
      badge: 'Extensión de Ciclo (+30 Días)',
      badgeBg: '#dcfce7',
      badgeColor: '#15803d',
      title: '¿Renovar Ciclo de Facturación?',
      message: `Se sumará 1 mes a la fecha de corte actual por la cuota fija de $${fee}.00 MXN y se reactivará la plataforma si se encontraba en modo pausa.`,
      points: [
        `Se registrará un comprobante de pago por $${fee}.00 MXN en el historial de recibos.`,
        'La nueva fecha de corte se extenderá 30 días automáticamente.',
        'La recepción de pedidos por WhatsApp se mantendrá activa e ilimitada.',
      ],
      bulletColor: '#16a34a',
      confirmText: 'Confirmar Renovación (+30 Días)',
      confirmBg: '#15803d',
      confirmShadow: 'rgba(21, 128, 61, 0.35)',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isProcessing: true }));
        try {
          const res = await fetch('/api/billing/renew', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: billingConfig.ownerPin, monthsToAdd: 1 }),
          }).then((r) => r.json());

          if (res.success) {
            renewBillingCycle({ pin: billingConfig.ownerPin, monthsToAdd: 1 });
            recordMonthlyPayment({
              amount: fee,
              paymentMethod: 'Transferencia Interbancaria SPEI (BBVA)',
              reference: subStatus?.paymentInfo?.reference || 'CAFETERIA-DEMO-01',
              period: `Mensualidad renovada (Vence: ${res.newNextBillingDate || 'Próximo mes'})`,
            });
            await refreshData();
            setConfirmModal(null);
            showFeedbackToast('success', '¡Ciclo Renovado Exitosamente!', res.message);
          } else {
            setConfirmModal((prev) => ({ ...prev, isProcessing: false }));
            showFeedbackToast('error', 'Error en renovación', res.error || res.message);
          }
        } catch (err) {
          setConfirmModal((prev) => ({ ...prev, isProcessing: false }));
          showFeedbackToast('error', 'Error de conexión', err.message);
        }
      },
    });
  };

  const handleToggleSuspension = () => {
    const currentlySuspended = Boolean(subStatus?.isSuspended);

    if (currentlySuspended) {
      // Modal Atractivo para REACTIVAR la plataforma
      setConfirmModal({
        icon: '▶️',
        iconBg: '#dcfce7',
        iconColor: '#16a34a',
        iconBorder: '#bbf7d0',
        iconShadow: 'rgba(22, 163, 74, 0.25)',
        badge: 'Habilitar Servicio Completo',
        badgeBg: '#dcfce7',
        badgeColor: '#15803d',
        title: '¿Reactivar Pedidos de la Plataforma?',
        message: 'La plataforma volverá a aceptar pedidos por WhatsApp y el restaurante operará con total normalidad.',
        points: [
          'El botón de pedidos por WhatsApp volverá a estar habilitado en la comanda del cliente.',
          'Se removerá el aviso de menú solo consulta.',
          'Se sincroniza de inmediato en vivo sin necesidad de reiniciar el servidor.',
        ],
        bulletColor: '#16a34a',
        confirmText: 'Sí, Reactivar Plataforma',
        confirmBg: '#15803d',
        confirmShadow: 'rgba(21, 128, 61, 0.35)',
        onConfirm: async () => {
          setConfirmModal((prev) => ({ ...prev, isProcessing: true }));
          try {
            const res = await fetch('/api/billing/pause', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                pin: billingConfig.ownerPin,
                suspend: false,
              }),
            }).then((r) => r.json());

            if (res.success) {
              setPlatformSuspension({
                pin: billingConfig.ownerPin,
                suspend: false,
              });
              await refreshData();
              setConfirmModal(null);
              showFeedbackToast('success', '¡Plataforma Reactivada!', res.message);
            } else {
              setConfirmModal((prev) => ({ ...prev, isProcessing: false }));
              showFeedbackToast('error', 'Error al reactivar', res.error || 'No se pudo actualizar el estado.');
            }
          } catch (err) {
            setConfirmModal((prev) => ({ ...prev, isProcessing: false }));
            showFeedbackToast('error', 'Error de conexión', err.message);
          }
        },
      });
    } else {
      // Modal Atractivo para PAUSAR la plataforma
      setConfirmModal({
        icon: '🛑',
        iconBg: '#fee2e2',
        iconColor: '#dc2626',
        iconBorder: '#fecaca',
        iconShadow: 'rgba(220, 38, 38, 0.25)',
        badge: 'Falta de Pago / Suspensión Manual',
        badgeBg: '#fee2e2',
        badgeColor: '#991b1b',
        title: '¿Pausar la Plataforma del Restaurante?',
        message: 'El menú digital cambiará al modo de solo consulta. Los clientes no podrán enviar pedidos a WhatsApp.',
        points: [
          'El menú completo, precios y fotografías seguirán 100% visibles para los clientes.',
          'El botón de WhatsApp se bloqueará y se mostrará un aviso neutro para ordenar directamente en el establecimiento.',
          'Podrás reactivar la plataforma en cualquier momento con un solo clic.',
        ],
        bulletColor: '#dc2626',
        confirmText: 'Sí, Pausar Plataforma',
        confirmBg: '#dc2626',
        confirmShadow: 'rgba(220, 38, 38, 0.35)',
        onConfirm: async () => {
          setConfirmModal((prev) => ({ ...prev, isProcessing: true }));
          try {
            const res = await fetch('/api/billing/pause', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                pin: billingConfig.ownerPin,
                suspend: true,
              }),
            }).then((r) => r.json());

            if (res.success) {
              setPlatformSuspension({
                pin: billingConfig.ownerPin,
                suspend: true,
              });
              await refreshData();
              setConfirmModal(null);
              showFeedbackToast('success', 'Plataforma Pausada', res.message);
            } else {
              setConfirmModal((prev) => ({ ...prev, isProcessing: false }));
              showFeedbackToast('error', 'Error al pausar', res.error || 'No se pudo actualizar el estado.');
            }
          } catch (err) {
            setConfirmModal((prev) => ({ ...prev, isProcessing: false }));
            showFeedbackToast('error', 'Error de conexión', err.message);
          }
        },
      });
    }
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

  // Filtrado de pedidos
  const filteredOrders = useMemo(() => {
    if (ordersFilter === 'domicilio') return orders.filter((o) => o.orderType?.includes('Domicilio'));
    if (ordersFilter === 'pickup') return orders.filter((o) => o.orderType?.includes('Buscar') || o.orderType === 'Para Llevar' || o.orderType === 'Mesa');
    return orders;
  }, [orders, ordersFilter]);

  // Filtrado de visitantes del log
  const filteredVisitors = useMemo(() => {
    if (!visitorStats?.visitors) return [];
    if (visitorsFilter === 'all') return visitorStats.visitors;
    if (visitorsFilter === 'mobile') {
      return visitorStats.visitors.filter((v) => {
        const d = (v.deviceType || '').toLowerCase();
        return d.includes('móvil') || d.includes('movil') || d.includes('smartphone');
      });
    }
    if (visitorsFilter === 'desktop') {
      return visitorStats.visitors.filter((v) => {
        const d = (v.deviceType || '').toLowerCase();
        return d.includes('computadora') || d.includes('escritorio');
      });
    }
    return visitorStats.visitors;
  }, [visitorStats, visitorsFilter]);

  // Si no está autenticado, mostrar pantalla de PIN
  if (!isAuthenticated) {
    return (
      <div className="admin-scope" style={styles.authContainer}>
        <div style={styles.authCard}>
          <div style={styles.authIconWrap}>🔒</div>
          <span style={styles.authKicker}>CAFETERÍA MARÍA BONITA</span>
          <h2 style={styles.authTitle}>Acceso de Administración</h2>
          <p style={styles.authSubtitle}>
            Panel de control de suscripción mensual, facturación y comandas para el dueño del restaurante.
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
                ⚠️ PIN incorrecto. (PIN configurado en billing.json: {billingConfig.ownerPin})
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

  const monthlyFee = subStatus?.monthlyFee || billingConfig.monthlyFee || 300;
  const paymentInfo = subStatus?.paymentInfo || billingConfig.paymentInfo || {};
  const reminderMsg = subStatus ? generateWhatsappReminderMessage(subStatus) : '';
  const clientWhatsappUrl = `https://wa.me/${subStatus?.billingPhone || '529831226847'}?text=${encodeURIComponent(reminderMsg)}`;

  return (
    <div className="admin-scope" style={styles.dashboardContainer}>
      {/* Barra Superior del Panel */}
      <header style={styles.headerBar}>
        <div style={styles.headerLeft}>
          <div style={styles.brandBadge}>
            ☕ <strong>{businessData?.brand?.name || brandData.brand?.name || 'Cafetería Demo'}</strong>
          </div>
          <span style={styles.headerDivider}>|</span>
          <span style={styles.headerPortalTag}>Portal de Suscripción & Facturación Mensual</span>
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

      {/* Menú de Navegación / Acceso Rápido a Secciones */}
      <nav style={styles.adminNavBar} aria-label="Navegación de Secciones del Panel">
        <div style={styles.navContainer}>
          <div style={styles.navHeaderInfo}>
            <span style={styles.navMenuBadge}>MENÚ DE SECCIONES</span>
          </div>

          <div style={styles.navTabsList}>
            <button
              type="button"
              onClick={() => setActiveAdminTab('all')}
              style={{
                ...styles.navTabBtn,
                ...(activeAdminTab === 'all' ? styles.navTabBtnActive : {}),
              }}
              title="Ver todas las secciones del panel en una sola página continua"
            >
              🗂️ Vista Completa (Todo)
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('orders')}
              style={{
                ...styles.navTabBtn,
                ...(activeAdminTab === 'orders' ? styles.navTabBtnActive : {}),
              }}
              title="Entrar a la sección de Registro de Comandas Recibidas desde el Menú Digital"
            >
              📋 Registro de Comandas
              <span
                style={{
                  ...styles.navTabBadge,
                  background: activeAdminTab === 'orders' ? '#ffffff' : '#fef3e7',
                  color: '#c25428',
                }}
              >
                {orders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('visitors')}
              style={{
                ...styles.navTabBtn,
                ...(activeAdminTab === 'visitors' ? styles.navTabBtnActive : {}),
              }}
              title="Entrar a la sección de Monitor de Tráfico & Bitácora de Visitantes por IP"
            >
              🌐 Monitor de Tráfico & Visitantes
              <span
                style={{
                  ...styles.navTabBadge,
                  background: activeAdminTab === 'visitors' ? '#ffffff' : '#dcfce7',
                  color: '#15803d',
                }}
              >
                {visitorStats?.totalIps ?? 0} IPs
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('billing')}
              style={{
                ...styles.navTabBtn,
                ...(activeAdminTab === 'billing' ? styles.navTabBtnActive : {}),
              }}
              title="Entrar a la sección de Facturación & Suscripción Mensual"
            >
              💳 Facturación & Suscripción
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('receipts')}
              style={{
                ...styles.navTabBtn,
                ...(activeAdminTab === 'receipts' ? styles.navTabBtnActive : {}),
              }}
              title="Entrar al Historial de Recibos y Comprobantes SPEI"
            >
              📜 Recibos ({history.length})
            </button>
          </div>
        </div>
      </nav>

      <main style={styles.mainContent}>
        {/* Barra de Salto Rápido cuando está en Vista Completa */}
        {activeAdminTab === 'all' && (
          <div style={styles.quickJumpBar}>
            <span style={styles.quickJumpLabel}>⚡ Salto directo en esta página:</span>
            <button type="button" onClick={() => scrollToSection('section-billing')} style={styles.quickJumpBtn}>
              💳 Facturación & Suscripción
            </button>
            <button type="button" onClick={() => scrollToSection('section-receipts')} style={styles.quickJumpBtn}>
              📜 Recibos ({history.length})
            </button>
            <button type="button" onClick={() => scrollToSection('section-orders')} style={styles.quickJumpBtn}>
              📋 Registro de Comandas ({orders.length})
            </button>
            <button type="button" onClick={() => scrollToSection('section-visitors')} style={styles.quickJumpBtn}>
              🌐 Monitor de Tráfico ({visitorStats?.totalIps ?? 0} IPs)
            </button>
          </div>
        )}

        {/* Banner de Contexto cuando está filtrado en una sección específica */}
        {activeAdminTab !== 'all' && (
          <div style={styles.activeSectionBanner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '1.4rem' }}>
                {activeAdminTab === 'orders' ? '📋' : activeAdminTab === 'visitors' ? '🌐' : activeAdminTab === 'billing' ? '💳' : '📜'}
              </span>
              <div>
                <span style={styles.activeSectionKicker}>SECCIÓN ACTIVA DEL MENÚ</span>
                <h2 style={styles.activeSectionTitle}>
                  {activeAdminTab === 'orders' && 'Registro de Comandas Recibidas desde el Menú Digital'}
                  {activeAdminTab === 'visitors' && 'Monitor de Tráfico & Bitácora de Visitantes'}
                  {activeAdminTab === 'billing' && 'Control de Facturación & Suscripción Mensual'}
                  {activeAdminTab === 'receipts' && 'Historial de Recibos y Comprobantes de Pago'}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveAdminTab('all')}
              style={styles.viewAllSectionsBtn}
              title="Volver a mostrar todas las secciones juntas"
            >
              🗂️ Ver Todo el Panel Completo
            </button>
          </div>
        )}
        {/* Sección: Control de Facturación & Suscripción Mensual */}
        {(activeAdminTab === 'all' || activeAdminTab === 'billing') && (
          <div id="section-billing">
            {/* Banner de bienvenida y aviso del ciclo */}
            <div style={styles.welcomeBanner}>
              <div>
                <h1 style={styles.bannerTitle}>Control de Suscripción & Facturación Mensual</h1>
                <p style={styles.bannerSubtitle}>
                  Cuota fija de plataforma: <strong>${monthlyFee}.00 {billingConfig.currency || 'MXN'} mensuales por adelantado</strong> • Apertura de mes de servicio con recepción de comandas por WhatsApp ilimitadas.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {subStatus && (
                  <a
                    href={clientWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...styles.actionBtn,
                      background: '#059669',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                    title="Abrir WhatsApp para enviar mensaje al cliente con datos de apertura de mes y SPEI"
                  >
                    📲 {subStatus.isFirstPaidMonth ? 'Enviar Bienvenida & Cobro (WA)' : 'Enviar Cobro de Mes (WA)'}
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleRenewCycle}
                  style={{
                    ...styles.actionBtn,
                    background: '#15803d',
                  }}
                  title="Registrar pago mensual SPEI y aperturar el siguiente mes de servicio (+1 Mes)"
                >
                  🔄 Renovar Ciclo (+30 Días)
                </button>
                <button
                  type="button"
                  onClick={handleToggleSuspension}
                  style={{
                    ...styles.actionBtn,
                    background: subStatus?.isSuspended ? '#2563eb' : '#dc2626',
                  }}
                  title={subStatus?.isSuspended ? "Reactivar pedidos por WhatsApp" : "Pausar pedidos por WhatsApp"}
                >
                  {subStatus?.isSuspended ? '▶️ Reactivar Plataforma' : '🛑 Pausar Plataforma (Falta de Pago)'}
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
                      ESTADO DE SUSCRIPCIÓN • ZONA HORARIA {subStatus.timezone || 'America/Cancun'}
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

                {/* Aviso especial si está en alerta o en modo solo lectura */}
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
                    <div>Modalidad: <strong>Pago por adelantado (Apertura de mes)</strong></div>
                    <div>Apertura de ciclo: <strong>{subStatus.nextBillingDate}</strong></div>
                    <div>Hoy en Cancún: <strong>{subStatus.todayCancun}</strong></div>
                    {subStatus.firstMonthFree && (
                      <div>Mes de cortesía: <strong>✅ 1er Mes Gratis Aplicado</strong></div>
                    )}
                    <div>Ciclo actual: <strong>Mes #{subStatus.billingCycleNumber || 2} {subStatus.isFirstPaidMonth ? '(1er cobro con bienvenida)' : '(Mensualidad recurrente)'}</strong></div>
                    <div>Días de gracia: <strong>{subStatus.graceDays} días tras apertura</strong></div>
                    <div>Aviso preventivo: <strong>{subStatus.reminderDaysBefore} días antes</strong></div>
                  </div>

                  <div style={{ background: '#faf7f2', padding: '1rem', borderRadius: '10px' }}>
                    <span style={{ display: 'block', color: '#6b5c52', fontWeight: 700, marginBottom: '0.3rem' }}>
                      🏦 Datos de Transferencia SPEI:
                    </span>
                    <div>Banco: <strong>{paymentInfo.bank || 'BBVA México'}</strong></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.2rem 0' }}>
                      <span>CLABE:</span>
                      <code style={{ background: '#ffffff', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                        {paymentInfo.clabe || '012180001234567890'}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(paymentInfo.clabe || '012180001234567890', 'clabe')}
                        style={styles.copySmallBtn}
                        title="Copiar CLABE"
                      >
                        {copiedField === 'clabe' ? '✓ Copiado' : 'Copiar'}
                      </button>
                    </div>
                    <div>Beneficiario: <strong>{paymentInfo.beneficiary || 'RedaySoft'}</strong></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <span>Referencia: <strong>{paymentInfo.reference || 'CAFETERIA-DEMO-01'}</strong></span>
                      <button
                        type="button"
                        onClick={() => handleCopy(paymentInfo.reference || 'CAFETERIA-DEMO-01', 'ref')}
                        style={styles.copySmallBtn}
                        title="Copiar Referencia"
                      >
                        {copiedField === 'ref' ? '✓ Copiado' : 'Copiar'}
                      </button>
                    </div>
                  </div>

                  <div style={{ background: '#faf7f2', padding: '1rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ display: 'block', color: '#6b5c52', fontWeight: 700, marginBottom: '0.3rem' }}>
                        💎 Tarifa Mensual Fija Adelantada:
                      </span>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c25428' }}>
                        ${monthlyFee}.00 {billingConfig.currency || 'MXN'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.3rem' }}>
                        Pago por adelantado para aperturar mes • Uso libre de menú y comandas
                      </div>
                    </div>
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
                      🏦 Liquidación exclusiva vía Transferencia SPEI
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tarjetas de Métricas Principales (Adaptadas al modelo mensual) */}
            <div style={styles.statsGrid}>
              {/* Card 1: Cuota Mensual Fija */}
              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <span style={styles.statLabel}>Cuota Mensual del Servicio</span>
                  <span style={styles.statIcon}>💎</span>
                </div>
                <div style={styles.statMainValue}>${monthlyFee}.00 {billingConfig.currency || 'MXN'}</div>
                <div style={styles.statSubtext}>
                  Membresía fija mensual • Sin comisiones por pedido
                </div>
              </div>

              {/* Card 2: Estado del Servicio */}
              <div
                style={{
                  ...styles.statCard,
                  background: subStatus?.canSendWhatsappOrder ? '#ffffff' : '#fef2f2',
                  borderColor: subStatus?.canSendWhatsappOrder ? '#e5e7eb' : '#fca5a5',
                }}
              >
                <div style={styles.statHeader}>
                  <span style={styles.statLabel}>Estado de la Plataforma</span>
                  <span style={styles.statIcon}>{subStatus?.canSendWhatsappOrder ? '🟢' : '🔴'}</span>
                </div>
                <div
                  style={{
                    ...styles.statMainValue,
                    color: subStatus?.canSendWhatsappOrder ? '#15803d' : '#b91c1c',
                  }}
                >
                  {subStatus?.canSendWhatsappOrder ? 'Pedidos Activos' : 'Modo Solo Lectura'}
                </div>
                <div style={styles.statSubtext}>
                  {subStatus?.canSendWhatsappOrder
                    ? 'Los clientes pueden ordenar por WhatsApp'
                    : 'Pedidos pausados por falta de pago'}
                </div>
              </div>

              {/* Card 3: Próximo Corte Programado */}
              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <span style={styles.statLabel}>Próximo Corte de Servicio</span>
                  <span style={styles.statIcon}>📅</span>
                </div>
                <div style={styles.statMainValue}>
                  {subStatus?.nextBillingDate || '2026-11-28'}
                </div>
                <div style={styles.statSubtext}>
                  {subStatus?.daysUntilDue !== undefined ? `${subStatus.daysUntilDue} días restantes de ciclo` : 'Corte cada 30 días'}
                </div>
                {/* Barra de progreso mensual */}
                <div style={styles.progressBarBg}>
                  <div
                    style={{
                      ...styles.progressBarFill,
                      width: `${Math.min(100, Math.max(10, ((30 - (subStatus?.daysUntilDue || 0)) / 30) * 100))}%`,
                      background: (subStatus?.daysUntilDue || 0) <= 3 ? '#ef4444' : '#c25428',
                    }}
                  ></div>
                </div>
              </div>

              {/* Card 4: Historial de Mensualidades */}
              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <span style={styles.statLabel}>Historial de Mensualidades</span>
                  <span style={styles.statIcon}>📑</span>
                </div>
                <div style={styles.statMainValue}>
                  {history.length} <span style={{ fontSize: '1rem', fontWeight: 600 }}>pagadas</span>
                </div>
                <div style={styles.statSubtext}>
                  {formatMoney(history.reduce((sum, r) => sum + (Number(r.totalPaid) || 0), 0))} MXN abonados a la fecha
                </div>
              </div>

              {/* Card 5: Comandas Enviadas por Clientes (Métrica Operativa) */}
              <div style={styles.statCard}>
                <div style={styles.statHeader}>
                  <span style={styles.statLabel}>Comandas Recibidas</span>
                  <span style={styles.statIcon}>🛍️</span>
                </div>
                <div style={styles.statMainValue}>{orders.length}</div>
                <div style={styles.statSubtext}>
                  Pedidos totales enviados desde el Menú Digital
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sección Principal: Instrucciones SPEI & Historial de Recibos */}
        {(activeAdminTab === 'all' || activeAdminTab === 'billing' || activeAdminTab === 'receipts') && (
          <div style={activeAdminTab === 'all' ? styles.twoColLayout : { marginBottom: '2.5rem' }}>
            {/* Columna Izquierda: Datos e Instrucciones de Pago SPEI */}
            {(activeAdminTab === 'all' || activeAdminTab === 'billing') && (
              <section id="section-spei" style={styles.speiCardSection}>
                <div style={styles.sectionHeaderSpei}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>🏦</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#27170e' }}>
                        Instrucciones de Pago de Mensualidad
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: '#6b5c52' }}>
                        Transferencia Interbancaria SPEI Oficial
                      </span>
                    </div>
                  </div>
                  <span style={styles.speiBadge}>Vía SPEI</span>
                </div>

                <div style={styles.speiBody}>
                  <div style={styles.speiHighlightBox}>
                    <span style={{ fontSize: '0.78rem', color: '#8c5936', fontWeight: 700, textTransform: 'uppercase' }}>
                      Importe Mensual a Transferir:
                    </span>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c25428', margin: '0.2rem 0' }}>
                      ${monthlyFee}.00 {billingConfig.currency || 'MXN'}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#6b5c52' }}>
                      Concepto: Membresía Menú Digital María Bonita
                    </span>
                  </div>

                  <div style={styles.speiDataGrid}>
                    <div style={styles.speiDataRow}>
                      <span style={styles.speiLabel}>Banco Receptor:</span>
                      <strong style={styles.speiVal}>{paymentInfo.bank || 'BBVA México'}</strong>
                    </div>

                    <div style={styles.speiDataRow}>
                      <span style={styles.speiLabel}>CLABE Interbancaria:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <code style={styles.codeVal}>{paymentInfo.clabe || '012180001234567890'}</code>
                        <button
                          type="button"
                          onClick={() => handleCopy(paymentInfo.clabe || '012180001234567890', 'clabe2')}
                          style={styles.copySmallBtn}
                        >
                          {copiedField === 'clabe2' ? '✓ Copiado' : 'Copiar'}
                        </button>
                      </div>
                    </div>

                    <div style={styles.speiDataRow}>
                      <span style={styles.speiLabel}>Beneficiario:</span>
                      <strong style={styles.speiVal}>{paymentInfo.beneficiary || 'RedaySoft Soluciones Digitales'}</strong>
                    </div>

                    <div style={styles.speiDataRow}>
                      <span style={styles.speiLabel}>Referencia Obligatoria:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <code style={styles.codeVal}>{paymentInfo.reference || 'MARIA-BONITA-01'}</code>
                        <button
                          type="button"
                          onClick={() => handleCopy(paymentInfo.reference || 'MARIA-BONITA-01', 'ref2')}
                          style={styles.copySmallBtn}
                        >
                          {copiedField === 'ref2' ? '✓ Copiado' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={styles.speiNoticeBox}>
                    <span style={{ fontSize: '1.1rem' }}>💡</span>
                    <p style={{ margin: 0, fontSize: '0.825rem', color: '#4a3b32', lineHeight: 1.45 }}>
                      Una vez realizada tu transferencia SPEI, puedes enviar tu comprobante al administrador por WhatsApp o presionar <strong>"Renovar Ciclo (+30 Días)"</strong> para archivar el pago y extender el servicio de inmediato.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const dataStr = `Banco: ${paymentInfo.bank || 'BBVA México'}\nCLABE: ${paymentInfo.clabe || '012180001234567890'}\nBeneficiario: ${paymentInfo.beneficiary || 'RedaySoft'}\nReferencia: ${paymentInfo.reference || 'MARIA-BONITA-01'}\nMonto: $${monthlyFee}.00 MXN`;
                      handleCopy(dataStr, 'all_spei');
                    }}
                    style={styles.copyAllBtn}
                  >
                    {copiedField === 'all_spei' ? '✓ ¡Datos Completos Copiados!' : '📋 Copiar Todos los Datos para SPEI'}
                  </button>
                </div>
              </section>
            )}

            {/* Columna Derecha: Historial de Comprobantes de Pago */}
            {(activeAdminTab === 'all' || activeAdminTab === 'receipts') && (
              <section id="section-receipts" style={styles.historySection}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <h3 style={styles.sectionHeading}>📜 Recibos y Comprobantes de Historial</h3>
                  <span style={{ fontSize: '0.8rem', background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: 700 }}>
                    {history.length} Emitidos
                  </span>
                </div>
                <p style={styles.sectionDesc}>
                  Comprobantes de pago de mensualidades registradas para la plataforma.
                </p>

                {history.length === 0 ? (
                  <div style={styles.emptyHistory}>Aún no se han emitido recibos de pago.</div>
                ) : (
                  <div style={styles.historyList}>
                    {history.map((receipt) => (
                      <div key={receipt.id} style={styles.receiptItem}>
                        <div>
                          <strong style={{ display: 'block', color: '#27170e', fontSize: '0.95rem' }}>
                            Comprobante #{receipt.id} ({receipt.folio})
                          </strong>
                          <span style={{ fontSize: '0.8rem', color: '#6b5c52', display: 'block', marginTop: '0.15rem' }}>
                            📅 {new Date(receipt.date).toLocaleDateString('es-MX')} • {receipt.period || 'Membresía Mensual'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, display: 'inline-block', marginTop: '0.2rem' }}>
                            ✓ {receipt.status || 'Aprobado y Liquidado'} ({receipt.paymentMethod || 'SPEI'})
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={styles.receiptAmount}>{formatMoney(receipt.totalPaid)} MXN</span>
                          <button
                            type="button"
                            onClick={() => setSelectedReceiptForModal(receipt)}
                            style={styles.receiptDetailBtn}
                          >
                            📄 Ver Recibo
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* Tabla Detallada de Pedidos Registrados (Métrica Operativa sin comisiones) */}
        {(activeAdminTab === 'all' || activeAdminTab === 'orders') && (
          <section id="section-orders" style={{ ...styles.tableSection, marginTop: activeAdminTab === 'orders' ? '0' : '2.5rem' }}>
            {/* Resumen rápido de métricas de comandas al entrar a la sección */}
            {activeAdminTab === 'orders' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ background: '#faf7f2', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #ebd9c5' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8c5936', textTransform: 'uppercase' }}>
                    📋 Comandas Totales
                  </span>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#27170e', marginTop: '0.2rem' }}>
                    {orders.length}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#6b5c52' }}>Registradas desde el Menú</span>
                </div>
                <div style={{ background: '#faf7f2', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #ebd9c5' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8c5936', textTransform: 'uppercase' }}>
                    🛍️ Pasar a Buscar / Mesa
                  </span>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#c25428', marginTop: '0.2rem' }}>
                    {orders.filter((o) => o.orderType?.includes('Buscar') || o.orderType === 'Para Llevar' || o.orderType === 'Mesa').length}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#6b5c52' }}>Para recoger o en salón</span>
                </div>
                <div style={{ background: '#faf7f2', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #ebd9c5' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8c5936', textTransform: 'uppercase' }}>
                    🛵 Envío a Domicilio
                  </span>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>
                    {orders.filter((o) => o.orderType?.includes('Domicilio')).length}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#6b5c52' }}>Con dirección de entrega</span>
                </div>
                <div style={{ background: '#faf7f2', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #ebd9c5' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8c5936', textTransform: 'uppercase' }}>
                    💵 Total Facturado Comandas
                  </span>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>
                    {formatMoney(orders.reduce((sum, o) => sum + (Number(o.orderTotal) || 0), 0))} MXN
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#6b5c52' }}>Venta acumulada en comandas</span>
                </div>
              </div>
            )}

            <div style={styles.tableHeaderRow}>
              <div>
                <h3 style={styles.sectionHeading}>📋 Registro de Comandas Recibidas desde el Menú Digital</h3>
                <p style={styles.sectionDesc}>
                  Historial de pedidos que los comensales han generado a través del carrito de compras y WhatsApp.
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
                  Todas ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrdersFilter('pickup')}
                  style={{
                    ...styles.filterBtn,
                    background: ordersFilter === 'pickup' ? '#c25428' : '#ffffff',
                    color: ordersFilter === 'pickup' ? '#ffffff' : '#27170e',
                  }}
                >
                  Pasar a Buscar ({orders.filter((o) => o.orderType?.includes('Buscar') || o.orderType === 'Para Llevar' || o.orderType === 'Mesa').length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrdersFilter('domicilio')}
                  style={{
                    ...styles.filterBtn,
                    background: ordersFilter === 'domicilio' ? '#c25428' : '#ffffff',
                    color: ordersFilter === 'domicilio' ? '#ffffff' : '#27170e',
                  }}
                >
                  A Domicilio ({orders.filter((o) => o.orderType?.includes('Domicilio')).length})
                </button>
              </div>
            </div>

            <div style={styles.tableResponsive}>
              <table style={styles.ordersTable}>
                <thead>
                  <tr>
                    <th style={styles.th}>Folio</th>
                    <th style={styles.th}>Fecha & Hora</th>
                    <th style={styles.th}>Modalidad</th>
                    <th style={styles.th}>Mesa / Cliente</th>
                    <th style={styles.th}>Comanda / Detalle</th>
                    <th style={styles.th}>Total de Cuenta</th>
                    <th style={styles.th}>Canal</th>
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
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={styles.orderTypeTag}>{ord.orderType}</span>
                            {ord.paymentMethod && (
                              <span
                                style={{
                                  ...styles.orderTypeTag,
                                  background: ord.paymentMethod === 'Transferencia' ? '#dbeafe' : '#fef3c7',
                                  color: ord.paymentMethod === 'Transferencia' ? '#1e40af' : '#92400e',
                                  borderColor: ord.paymentMethod === 'Transferencia' ? '#bfdbfe' : '#fde68a',
                                }}
                              >
                                {ord.paymentMethod === 'Transferencia' ? '🏦 Transferencia' : '💵 Efectivo'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={styles.td}>{ord.customerRef}</td>
                        <td style={{ ...styles.td, maxWidth: '280px', fontSize: '0.8rem', color: '#555' }}>
                          {ord.itemsSummary || `${ord.itemsCount || 1} artículos`}
                        </td>
                        <td style={styles.td}>
                          <strong style={{ color: '#27170e' }}>{formatMoney(ord.orderTotal)}</strong>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.badgePaid}>📲 Enviado a WhatsApp</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Sección: Monitor de Tráfico en Vivo & Bitácora de Visitantes por IP */}
        {(activeAdminTab === 'all' || activeAdminTab === 'visitors') && (
          <section id="section-visitors" style={{ ...styles.tableSection, marginTop: activeAdminTab === 'visitors' ? '0' : '2.5rem' }}>
            <div style={styles.tableHeaderRow}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <h3 style={styles.sectionHeading}>🌐 Monitor de Tráfico & Bitácora de Visitantes</h3>
                  <span
                    style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '0.2rem 0.65rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    🟢 Registro Activo en logs/visitors.log
                  </span>
                </div>
                <p style={styles.sectionDesc}>
                  Monitoreo interno de clientes e IPs que acceden al Menú Digital. Si una IP re-ingresa, se actualiza automáticamente su fecha, hora y dispositivo.
                </p>
              </div>

              {/* Botones de acción y filtros */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleRefreshVisitors}
                  disabled={isLoadingVisitors}
                  style={{
                    ...styles.actionBtn,
                    background: '#2563eb',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.82rem',
                  }}
                  title="Volver a leer la bitácora de logs/visitors.log"
                >
                  {isLoadingVisitors ? '⏳ Cargando...' : '🔄 Refrescar Accesos'}
                </button>
                <a
                  href="/api/visitors/record?view=raw"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...styles.actionBtn,
                    background: '#475569',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.82rem',
                  }}
                  title="Abrir el archivo plano de logs/visitors.log"
                >
                  📄 Ver Bitácora Cruda (.log)
                </a>
              </div>
            </div>

            {/* Mini Tarjetas de Métricas de Visitantes */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '1rem',
                margin: '1.2rem 0 1.5rem 0',
              }}
            >
              <div style={{ background: '#faf7f2', padding: '1rem 1.2rem', borderRadius: '12px', border: '1px solid #ebd9c5' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8c5936', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  👥 IPs Únicas Registradas
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#27170e', marginTop: '0.2rem' }}>
                  {visitorStats?.totalIps ?? 0}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#6b5c52' }}>
                  Visitantes distintos identificados
                </span>
              </div>

              <div style={{ background: '#faf7f2', padding: '1rem 1.2rem', borderRadius: '12px', border: '1px solid #ebd9c5' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8c5936', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🔄 Total de Entradas / Visitas
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', marginTop: '0.2rem' }}>
                  {visitorStats?.totalVisits ?? 0}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#6b5c52' }}>
                  Aperturas y re-ingresos al sitio
                </span>
              </div>

              <div style={{ background: '#faf7f2', padding: '1rem 1.2rem', borderRadius: '12px', border: '1px solid #ebd9c5' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8c5936', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📱 Clientes en Celular (Móvil)
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', marginTop: '0.2rem' }}>
                  {visitorStats?.mobileCount ?? 0}{' '}
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#15803d' }}>
                    ({visitorStats?.mobilePercent ?? 0}%)
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#6b5c52' }}>
                  Smartphones Android & iPhone
                </span>
              </div>

              <div style={{ background: '#faf7f2', padding: '1rem 1.2rem', borderRadius: '12px', border: '1px solid #ebd9c5' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#8c5936', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  💻 Clientes en Computadora
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.2rem' }}>
                  {visitorStats?.desktopCount ?? 0}{' '}
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6d28d9' }}>
                    ({visitorStats?.desktopPercent ?? 0}%)
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#6b5c52' }}>
                  Escritorio Windows, Mac y Linux
                </span>
              </div>
            </div>

            {/* Barra Visual de Distribución de Dispositivos */}
            {Boolean(visitorStats?.totalIps) && (
              <div style={{ marginBottom: '1.5rem', background: '#faf7f2', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #ebd9c5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: '#27170e' }}>
                  <span>📱 Móvil: {visitorStats?.mobilePercent ?? 0}%</span>
                  <span>💻 Computadora: {visitorStats?.desktopPercent ?? 0}%</span>
                </div>
                <div style={{ height: '10px', width: '100%', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${visitorStats?.mobilePercent ?? 0}%`, background: '#16a34a', transition: 'width 0.4s' }} title={`Móvil: ${visitorStats?.mobilePercent}%`} />
                  <div style={{ width: `${visitorStats?.desktopPercent ?? 0}%`, background: '#7c3aed', transition: 'width 0.4s' }} title={`Computadora: ${visitorStats?.desktopPercent}%`} />
                </div>
              </div>
            )}

            {/* Filtros de la Tabla de Visitantes */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.85rem' }}>
              <div style={styles.filterButtonGroup}>
                <button
                  type="button"
                  onClick={() => setVisitorsFilter('all')}
                  style={{
                    ...styles.filterBtn,
                    background: visitorsFilter === 'all' ? '#c25428' : '#ffffff',
                    color: visitorsFilter === 'all' ? '#ffffff' : '#27170e',
                  }}
                >
                  Todas las IPs ({visitorStats?.totalIps ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => setVisitorsFilter('mobile')}
                  style={{
                    ...styles.filterBtn,
                    background: visitorsFilter === 'mobile' ? '#c25428' : '#ffffff',
                    color: visitorsFilter === 'mobile' ? '#ffffff' : '#27170e',
                  }}
                >
                  📱 Solo Móvil ({visitorStats?.mobileCount ?? 0})
                </button>
                <button
                  type="button"
                  onClick={() => setVisitorsFilter('desktop')}
                  style={{
                    ...styles.filterBtn,
                    background: visitorsFilter === 'desktop' ? '#c25428' : '#ffffff',
                    color: visitorsFilter === 'desktop' ? '#ffffff' : '#27170e',
                  }}
                >
                  💻 Solo Computadora ({visitorStats?.desktopCount ?? 0})
                </button>
              </div>

              {visitorStats?.lastUpdate && (
                <span style={{ fontSize: '0.78rem', color: '#6b5c52' }}>
                  🕒 Última actividad registrada: <strong>{visitorStats.lastUpdate}</strong>
                </span>
              )}
            </div>

            {/* Tabla de Visitantes */}
            <div style={styles.tableResponsive}>
              <table style={styles.ordersTable}>
                <thead>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>IP Pública</th>
                    <th style={styles.th}>Dispositivo</th>
                    <th style={styles.th}>Sistema Operativo & Navegador</th>
                    <th style={styles.th}>Última Entrada (Cancún)</th>
                    <th style={styles.th}>Primera Entrada</th>
                    <th style={styles.th}>Visitas</th>
                    <th style={styles.th}>Última Sección</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisitors.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#6b5c52' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>🌐</div>
                        <strong>No hay registros de visitantes en este filtro.</strong>
                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.3rem' }}>
                          Al abrir el Menú Digital desde cualquier celular o PC, las IPs públicas y sus dispositivos se registrarán aquí automáticamente.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredVisitors.map((vis, idx) => {
                      const isMobile = (vis.deviceType || '').toLowerCase().includes('móvil') || (vis.deviceType || '').toLowerCase().includes('smartphone');
                      const isTablet = (vis.deviceType || '').toLowerCase().includes('tablet');
                      return (
                        <tr key={vis.ip || idx} style={styles.tr}>
                          <td style={{ ...styles.td, fontSize: '0.8rem', color: '#888', width: '40px' }}>
                            #{String(idx + 1).padStart(3, '0')}
                          </td>
                          <td style={styles.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <code style={{ background: '#f1ece6', padding: '0.18rem 0.45rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem' }}>
                                {vis.ip}
                              </code>
                              {vis.totalVisits > 1 && (
                                <span
                                  style={{
                                    background: '#dbeafe',
                                    color: '#1e40af',
                                    padding: '0.15rem 0.4rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                  }}
                                  title="Cliente que ha re-ingresado a la plataforma"
                                >
                                  Recurrente
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.25rem 0.55rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                background: isMobile ? '#dcfce7' : isTablet ? '#fef3c7' : '#ede9fe',
                                color: isMobile ? '#166534' : isTablet ? '#92400e' : '#5b21b6',
                              }}
                            >
                              <span>{isMobile ? '📱' : isTablet ? '📲' : '💻'}</span>
                              {vis.deviceType || 'Computadora'}
                            </span>
                          </td>
                          <td style={{ ...styles.td, fontSize: '0.83rem', color: '#374151' }}>
                            <strong>{vis.os || 'Desconocido'}</strong>
                            <span style={{ color: '#6b7280', display: 'block', fontSize: '0.76rem' }}>
                              {vis.browser || 'Navegador Web'}
                            </span>
                          </td>
                          <td style={{ ...styles.td, fontSize: '0.83rem' }}>
                            <strong style={{ color: '#111827' }}>{vis.lastVisit}</strong>
                          </td>
                          <td style={{ ...styles.td, fontSize: '0.8rem', color: '#6b7280' }}>
                            {vis.firstVisit || vis.lastVisit}
                          </td>
                          <td style={styles.td}>
                            <span
                              style={{
                                display: 'inline-block',
                                background: vis.totalVisits > 1 ? '#e0f2fe' : '#f3f4f6',
                                color: vis.totalVisits > 1 ? '#0369a1' : '#374151',
                                fontWeight: 800,
                                padding: '0.2rem 0.55rem',
                                borderRadius: '9999px',
                                fontSize: '0.78rem',
                              }}
                            >
                              {vis.totalVisits || 1} {vis.totalVisits === 1 ? 'visita' : 'visitas'}
                            </span>
                          </td>
                          <td style={{ ...styles.td, fontSize: '0.8rem', color: '#6b7280' }}>
                            <code style={{ background: '#f8fafc', padding: '0.15rem 0.35rem', borderRadius: '4px' }}>
                              {vis.lastPath || '/'}
                            </code>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* Modal de Detalle de Recibo de Pago Mensual */}
      {selectedReceiptForModal && (
        <div style={styles.modalOverlay} onClick={() => setSelectedReceiptForModal(null)}>
          <div style={styles.receiptModalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#27170e' }}>
                📄 Comprobante Oficial de Mensualidad
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
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: '0.6rem' }}>
                  <img
                    src="/assets/redaysoft_logo.png"
                    alt="RedaySoft Soluciones Digitales"
                    style={{
                      height: '64px',
                      width: 'auto',
                      maxWidth: '240px',
                      objectFit: 'contain',
                      display: 'block',
                      margin: '0 auto',
                    }}
                  />
                </div>
                <h2 style={{ margin: '0.2rem 0', fontSize: '1.45rem', color: '#27170e' }}>
                  Recibo de Mensualidad
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#666' }}>
                  Folio de Comprobante: <strong>{selectedReceiptForModal.folio}</strong>
                </span>
              </div>

              <div style={styles.receiptGrid}>
                <div>
                  <span style={styles.receiptMetaLabel}>Cliente / Establecimiento:</span>
                  <p style={styles.receiptMetaVal}>{businessData?.brand?.name || brandData.brand?.name || 'Cafetería Demo'}</p>
                </div>
                <div>
                  <span style={styles.receiptMetaLabel}>Fecha de Liquidación:</span>
                  <p style={styles.receiptMetaVal}>
                    {new Date(selectedReceiptForModal.date).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <span style={styles.receiptMetaLabel}>Método de Pago:</span>
                  <p style={styles.receiptMetaVal}>{selectedReceiptForModal.paymentMethod || 'Transferencia SPEI'}</p>
                </div>
                <div>
                  <span style={styles.receiptMetaLabel}>Número de Recibo:</span>
                  <p style={styles.receiptMetaVal}>{selectedReceiptForModal.id}</p>
                </div>
              </div>

              <div style={{ background: '#fbf9f6', padding: '1rem', borderRadius: '12px', margin: '1rem 0', border: '1px solid #ebd9c5' }}>
                <span style={{ fontSize: '0.75rem', color: '#8c5936', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Concepto del Servicio Contratado:
                </span>
                <p style={{ margin: '0.25rem 0 0.4rem 0', fontWeight: 800, color: '#27170e', fontSize: '0.95rem' }}>
                  {selectedReceiptForModal.concept || 'Cuota Mensual Mantenimiento & Menú Digital'}
                </p>
                <div style={{ fontSize: '0.8rem', color: '#6b5c52', lineHeight: 1.45, marginBottom: '0.5rem' }}>
                  • Menú Digital 24/7 para comensales en salón y pedidos para llevar.<br />
                  • Recepción ilimitada de comandas automáticas por WhatsApp.<br />
                  • Alojamiento en la nube y soporte técnico continuo.<br />
                  • <strong>Periodo cubierto:</strong> {selectedReceiptForModal.period || 'Membresía Mensual Activa (+30 Días)'}.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', fontSize: '0.88rem' }}>
                <span style={{ color: '#6b5c52' }}>Cuota Mensual del Servicio:</span>
                <strong>{formatMoney(selectedReceiptForModal.totalPaid || monthlyFee)} MXN</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', fontSize: '0.88rem' }}>
                <span style={{ color: '#6b5c52' }}>Cargos extra por pedidos:</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>$0.00 MXN (Incluido)</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '2px solid #27170e',
                  fontSize: '1.25rem',
                  marginTop: '0.5rem',
                }}
              >
                <strong>Total Pagado:</strong>
                <strong style={{ color: '#c25428' }}>{formatMoney(selectedReceiptForModal.totalPaid || monthlyFee)} MXN</strong>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#666', fontStyle: 'italic', marginTop: '0.35rem', textAlign: 'right' }}>
                (Trescientos pesos 00/100 M.N.)
              </div>

              <div style={{ textAlign: 'center', marginTop: '1.1rem', padding: '0.6rem', background: '#dcfce7', borderRadius: '8px', color: '#166534', fontSize: '0.85rem', fontWeight: 800, border: '1px solid #bbf7d0' }}>
                ✓ {selectedReceiptForModal.status || 'Aprobado y Liquidado'} (Vía Transferencia SPEI)
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={() => printReceiptDocument(selectedReceiptForModal)}
                style={styles.printBtn}
                title="Genera el documento en formato PDF de 1 sola hoja para imprimir o guardar"
              >
                🖨️ Imprimir / Guardar PDF (1 Hoja)
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

      {/* Ventana Atractiva de Confirmación para Pausar / Reactivar / Renovar */}
      {confirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(23, 14, 8, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.25rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => !confirmModal.isProcessing && setConfirmModal(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 70px rgba(0,0,0,0.35)',
              overflow: 'hidden',
              border: '1px solid rgba(194, 84, 40, 0.15)',
              textAlign: 'center',
              padding: '2.25rem 2rem 1.75rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ícono llamativo con círculo sombreado */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: confirmModal.iconBg || '#fef2f2',
                color: confirmModal.iconColor || '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.1rem',
                margin: '0 auto 1.25rem',
                boxShadow: `0 8px 24px ${confirmModal.iconShadow || 'rgba(220, 38, 38, 0.25)'}`,
                border: `2px solid ${confirmModal.iconBorder || '#fecaca'}`,
              }}
            >
              {confirmModal.icon}
            </div>

            {/* Badge de Categoría */}
            {confirmModal.badge && (
              <span
                style={{
                  display: 'inline-block',
                  background: confirmModal.badgeBg || '#fee2e2',
                  color: confirmModal.badgeColor || '#991b1b',
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  padding: '0.3rem 0.85rem',
                  borderRadius: '9999px',
                  marginBottom: '0.75rem',
                }}
              >
                {confirmModal.badge}
              </span>
            )}

            {/* Título Principal */}
            <h3
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '1.5rem',
                color: '#27170e',
                margin: '0 0 0.5rem 0',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                lineHeight: 1.25,
              }}
            >
              {confirmModal.title}
            </h3>

            {/* Mensaje descriptivo */}
            <p
              style={{
                color: '#6b7280',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                margin: '0 0 1.25rem 0',
              }}
            >
              {confirmModal.message}
            </p>

            {/* Puntos de impacto inmediato */}
            {confirmModal.points && confirmModal.points.length > 0 && (
              <div
                style={{
                  background: '#fbf9f6',
                  border: '1px solid #ebd9c5',
                  borderRadius: '14px',
                  padding: '1rem 1.2rem',
                  textAlign: 'left',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#8c5936',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '0.5rem',
                  }}
                >
                  Efecto inmediato en la plataforma:
                </div>
                {confirmModal.points.map((pt, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      fontSize: '0.825rem',
                      color: '#4a3b32',
                      marginBottom: idx === confirmModal.points.length - 1 ? 0 : '0.45rem',
                      lineHeight: 1.45,
                    }}
                  >
                    <span style={{ color: confirmModal.bulletColor || '#dc2626', fontWeight: 'bold' }}>•</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Botones de Acción */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
              }}
            >
              <button
                type="button"
                disabled={confirmModal.isProcessing}
                onClick={() => setConfirmModal(null)}
                style={{
                  flex: 1,
                  background: '#f3f4f6',
                  color: '#4b5563',
                  border: '1px solid #e5e7eb',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: confirmModal.isProcessing ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={confirmModal.isProcessing}
                onClick={confirmModal.onConfirm}
                style={{
                  flex: 1.4,
                  background: confirmModal.confirmBg || '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '12px',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: confirmModal.isProcessing ? 'not-allowed' : 'pointer',
                  boxShadow: `0 4px 14px ${confirmModal.confirmShadow || 'rgba(220, 38, 38, 0.35)'}`,
                  opacity: confirmModal.isProcessing ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                }}
              >
                {confirmModal.isProcessing ? (
                  <>
                    <span>⏳</span>
                    <span>Guardando cambios...</span>
                  </>
                ) : (
                  confirmModal.confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificación Toast Atractiva */}
      {feedbackToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1050,
            background: feedbackToast.type === 'success' ? '#15803d' : '#dc2626',
            color: '#ffffff',
            padding: '1rem 1.4rem',
            borderRadius: '14px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            maxWidth: '430px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>
            {feedbackToast.type === 'success' ? '✅' : '⚠️'}
          </span>
          <div style={{ flex: 1 }}>
            <strong style={{ display: 'block', fontSize: '0.95rem' }}>{feedbackToast.title}</strong>
            <span style={{ fontSize: '0.825rem', opacity: 0.92 }}>{feedbackToast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.2rem',
              cursor: 'pointer',
              opacity: 0.8,
              padding: '0.2rem',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

// Estilos limpios y profesionales adaptados al modelo de suscripción mensual
const styles = {
  authContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1f120a 0%, #3d2315 100%)',
    padding: '1.5rem',
  },
  authCard: {
    background: '#ffffff',
    borderRadius: '18px',
    padding: '2.5rem',
    maxWidth: '440px',
    width: '100%',
    boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
    textAlign: 'center',
  },
  authIconWrap: {
    width: '56px',
    height: '56px',
    background: '#fef3e7',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    margin: '0 auto 1rem',
  },
  authKicker: {
    fontSize: '0.75rem',
    fontWeight: 800,
    color: '#c25428',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  authTitle: {
    margin: '0.3rem 0 0.6rem',
    color: '#27170e',
    fontFamily: 'var(--font-sans)',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    fontSize: '1.6rem',
  },
  authSubtitle: {
    color: '#6b5c52',
    fontSize: '0.85rem',
    lineHeight: 1.5,
    marginBottom: '1.5rem',
  },
  authForm: {
    textAlign: 'left',
  },
  authLabel: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#27170e',
    marginBottom: '0.5rem',
  },
  authInput: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1.5px solid #d1c7bc',
    borderRadius: '8px',
    fontSize: '1.1rem',
    textAlign: 'center',
    letterSpacing: '0.2em',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '0.75rem',
  },
  authErrorMsg: {
    color: '#ef4444',
    fontSize: '0.8rem',
    margin: '0 0 1rem',
    textAlign: 'center',
  },
  authSubmitBtn: {
    width: '100%',
    padding: '0.85rem',
    background: '#c25428',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  authFooter: {
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f0ebe4',
  },
  authBackLink: {
    color: '#8c5936',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 600,
  },

  // Panel Principal
  dashboardContainer: {
    minHeight: '100vh',
    background: '#f7f4ef',
    color: '#27170e',
    fontFamily: 'var(--font-sans)',
  },
  headerBar: {
    background: '#ffffff',
    borderBottom: '1px solid #e8e2d8',
    padding: '0.85rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
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
    color: '#8c5936',
    fontWeight: 600,
    background: '#fef3e7',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  viewMenuBtn: {
    background: '#f4ede4',
    color: '#27170e',
    textDecoration: 'none',
    padding: '0.5rem 0.9rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 600,
    border: '1px solid #e0d5c7',
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: '0.85rem',
    cursor: 'pointer',
    padding: '0.5rem',
  },

  // Barra de Menú de Secciones del Administrador
  adminNavBar: {
    background: '#ffffff',
    borderBottom: '2px solid #ebd9c5',
    position: 'sticky',
    top: 0,
    zIndex: 90,
    boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
  },
  navContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0.65rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  navHeaderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  navMenuBadge: {
    fontSize: '0.72rem',
    fontWeight: 800,
    letterSpacing: '0.08em',
    color: '#8c5936',
    textTransform: 'uppercase',
    background: '#fef3e7',
    padding: '0.2rem 0.55rem',
    borderRadius: '6px',
    border: '1px solid #fed7aa',
  },
  navTabsList: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    padding: '0.2rem 0',
    maxWidth: '100%',
  },
  navTabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.45rem',
    background: '#faf7f2',
    border: '1px solid #ebd9c5',
    color: '#4a3b32',
    padding: '0.5rem 0.95rem',
    borderRadius: '10px',
    fontSize: '0.84rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.18s ease',
  },
  navTabBtnActive: {
    background: '#c25428',
    color: '#ffffff',
    borderColor: '#b04920',
    boxShadow: '0 3px 10px rgba(194, 84, 40, 0.28)',
  },
  navTabBadge: {
    fontSize: '0.72rem',
    fontWeight: 800,
    padding: '0.12rem 0.45rem',
    borderRadius: '9999px',
    display: 'inline-block',
  },
  quickJumpBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
    background: '#faf7f2',
    border: '1px solid #ebd9c5',
    borderRadius: '10px',
    padding: '0.6rem 1rem',
    marginBottom: '1.5rem',
  },
  quickJumpLabel: {
    fontSize: '0.8rem',
    color: '#6b5c52',
    fontWeight: 700,
  },
  quickJumpBtn: {
    background: '#ffffff',
    border: '1px solid #d1c7bc',
    color: '#27170e',
    padding: '0.3rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  activeSectionBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.75rem',
    background: '#ffffff',
    border: '1px solid #ebd9c5',
    borderRadius: '12px',
    padding: '0.85rem 1.25rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  activeSectionKicker: {
    fontSize: '0.72rem',
    color: '#8c5936',
    fontWeight: 800,
    textTransform: 'uppercase',
    display: 'block',
  },
  activeSectionTitle: {
    margin: '0.15rem 0 0 0',
    fontSize: '1.1rem',
    fontWeight: 800,
    color: '#27170e',
  },
  viewAllSectionsBtn: {
    background: '#f4ede4',
    border: '1px solid #ebd9c5',
    color: '#27170e',
    padding: '0.45rem 0.85rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
  },

  mainContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },

  welcomeBanner: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '1.75rem 2rem',
    marginBottom: '1.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1.25rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    border: '1px solid #ebd9c5',
  },
  bannerTitle: {
    margin: 0,
    fontSize: '1.6rem',
    fontFamily: 'var(--font-sans)',
    fontWeight: 800,
    letterSpacing: '-0.025em',
    color: '#27170e',
  },
  bannerSubtitle: {
    margin: '0.35rem 0 0 0',
    color: '#6b5c52',
    fontSize: '0.9rem',
  },
  actionBtn: {
    color: '#ffffff',
    border: 'none',
    padding: '0.65rem 1.25rem',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    transition: 'transform 0.15s, opacity 0.15s',
  },
  copySmallBtn: {
    background: '#ffffff',
    border: '1px solid #d1c7bc',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    color: '#8c5936',
    fontWeight: 700,
  },

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#ffffff',
    borderRadius: '14px',
    padding: '1.25rem 1.4rem',
    border: '1px solid #e8e2d8',
    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.6rem',
  },
  statLabel: {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#6b5c52',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  statIcon: {
    fontSize: '1.2rem',
  },
  statMainValue: {
    fontSize: '1.65rem',
    fontWeight: 800,
    color: '#27170e',
    margin: '0.2rem 0',
  },
  statSubtext: {
    fontSize: '0.78rem',
    color: '#888',
    marginTop: '0.25rem',
  },
  progressBarBg: {
    width: '100%',
    height: '6px',
    background: '#eee',
    borderRadius: '9999px',
    marginTop: '0.75rem',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '9999px',
  },

  // Layout 2 Columnas
  twoColLayout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '1.75rem',
    marginBottom: '2.5rem',
  },

  // Columna SPEI
  speiCardSection: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #ebd9c5',
    boxShadow: '0 4px 25px rgba(0,0,0,0.03)',
    overflow: 'hidden',
  },
  sectionHeaderSpei: {
    background: '#fbf9f6',
    padding: '1.1rem 1.5rem',
    borderBottom: '1px solid #ebd9c5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  speiBadge: {
    background: '#15803d',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: 800,
    padding: '0.25rem 0.65rem',
    borderRadius: '9999px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  speiBody: {
    padding: '1.5rem',
  },
  speiHighlightBox: {
    background: '#faf6f0',
    border: '1px solid #ebd9c5',
    borderRadius: '12px',
    padding: '1.25rem',
    textAlign: 'center',
    marginBottom: '1.25rem',
  },
  speiDataGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    fontSize: '0.85rem',
    marginBottom: '1.25rem',
  },
  speiDataRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #f1ece6',
  },
  speiLabel: {
    color: '#6b5c52',
    fontWeight: 600,
  },
  speiVal: {
    color: '#27170e',
  },
  codeVal: {
    background: '#f4ede4',
    padding: '0.2rem 0.45rem',
    borderRadius: '6px',
    fontWeight: 700,
    fontSize: '0.85rem',
    color: '#1f120a',
  },
  speiNoticeBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    background: '#fef9ee',
    border: '1px solid #fed7aa',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    marginBottom: '1.25rem',
  },
  copyAllBtn: {
    width: '100%',
    padding: '0.85rem',
    background: '#c25428',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },

  // Columna Historial
  historySection: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #ebd9c5',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
  },
  sectionHeading: {
    margin: 0,
    fontSize: '1.25rem',
    fontFamily: 'var(--font-sans)',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: '#27170e',
  },
  sectionDesc: {
    margin: '0.25rem 0 1rem 0',
    color: '#6b5c52',
    fontSize: '0.825rem',
  },
  emptyHistory: {
    textAlign: 'center',
    padding: '2.5rem 1rem',
    color: '#999',
    fontSize: '0.85rem',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    maxHeight: '360px',
    overflowY: 'auto',
  },
  receiptItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.85rem 1rem',
    background: '#faf7f2',
    borderRadius: '10px',
    border: '1px solid #ebd9c5',
  },
  receiptAmount: {
    display: 'block',
    fontWeight: 800,
    color: '#c25428',
    fontSize: '1rem',
    marginBottom: '0.25rem',
  },
  receiptDetailBtn: {
    background: '#ffffff',
    border: '1px solid #c25428',
    color: '#c25428',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
  },

  // Tabla de Pedidos
  tableSection: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '1.75rem',
    border: '1px solid #ebd9c5',
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
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
    gap: '0.4rem',
    background: '#f4ede4',
    padding: '0.25rem',
    borderRadius: '8px',
  },
  filterBtn: {
    border: 'none',
    padding: '0.4rem 0.85rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  ordersTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    background: '#faf6f0',
    color: '#6b5c52',
    fontWeight: 700,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    borderBottom: '1px solid #e8e2d8',
  },
  tr: {
    borderBottom: '1px solid #f0ebe4',
  },
  td: {
    padding: '0.85rem 1rem',
  },
  orderTypeTag: {
    background: '#fef3e7',
    color: '#c25428',
    padding: '0.2rem 0.55rem',
    borderRadius: '4px',
    fontWeight: 700,
    fontSize: '0.75rem',
  },
  badgePaid: {
    background: '#dcfce7',
    color: '#15803d',
    padding: '0.25rem 0.6rem',
    borderRadius: '6px',
    fontWeight: 700,
    fontSize: '0.75rem',
  },

  // Modal Recibo
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '1rem',
  },
  receiptModalCard: {
    background: '#ffffff',
    borderRadius: '20px',
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
    marginBottom: '1.25rem',
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
    background: '#eee',
    color: '#444',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
};
