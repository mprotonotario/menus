import { BUSINESS_DATA } from '../data/menuData';

const RUNTIME_OVERRIDE_KEY = 'mb_billing_runtime_override';
const TIMEZONE = 'America/Cancun';

/**
 * Obtener la fecha actual desglosada exactamente en zona horaria America/Cancun
 */
export function getCancunDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const partMap = {};
  parts.forEach((p) => {
    partMap[p.type] = p.value;
  });

  const dateStr = `${partMap.year}-${partMap.month}-${partMap.day}`; // YYYY-MM-DD
  return {
    dateStr,
    year: parseInt(partMap.year, 10),
    month: parseInt(partMap.month, 10),
    day: parseInt(partMap.day, 10),
    hour: parseInt(partMap.hour, 10),
    minute: parseInt(partMap.minute, 10),
  };
}

/**
 * Calcula la diferencia en días enteros entre la fecha actual en America/Cancun y la fecha objetivo (YYYY-MM-DD).
 * Positivo: faltan X días para el corte.
 * Cero: hoy es el día de corte.
 * Negativo: han transcurrido X días tras el corte.
 */
export function getDiffDaysInCancun(targetIsoDate) {
  if (!targetIsoDate) return 0;
  const cancun = getCancunDateParts();

  const [tY, tM, tD] = targetIsoDate.split('T')[0].split('-').map(Number);

  // Usamos Date.UTC a medianoche para evitar cualquier desfase de horario de verano
  const targetUtc = Date.UTC(tY, tM - 1, tD);
  const currentUtc = Date.UTC(cancun.year, cancun.month - 1, cancun.day);

  const diffMs = targetUtc - currentUtc;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Obtener configuración activa con soporte para sobreescrituras en vivo (renovaciones)
 */
export function getEffectiveBillingConfig() {
  const baseConfig = BUSINESS_DATA.platformBilling || {
    commissionPerOrder: 3,
    monthlyFee: 249,
    currency: 'MXN',
    cycleDays: 30,
    graceDays: 5,
    reminderDaysBefore: 3,
    nextBillingDate: '2026-11-28',
    billingPhone: '529831226847',
    whatsappRecipient: '529831226847',
    ownerPin: '2026',
    stripePublishableKey: 'pk_test_TYooMQauvdEDq54NiTphI7jx',
    companyName: 'RedaySoft Software & Menús Digitales',
    supportEmail: 'facturacion@redaysoft.com',
    paymentInfo: {
      bank: 'BBVA México',
      clabe: '012180001234567890',
      beneficiary: 'RedaySoft Soluciones Digitales S.A.S.',
      reference: 'MARIA-BONITA-01',
      paymentLink: 'https://buy.stripe.com/test_maria_bonita_mensualidad',
    },
  };

  if (typeof window !== 'undefined') {
    try {
      const rawOverride = localStorage.getItem(RUNTIME_OVERRIDE_KEY);
      if (rawOverride) {
        const override = JSON.parse(rawOverride);
        return {
          ...baseConfig,
          ...override,
          paymentInfo: {
            ...baseConfig.paymentInfo,
            ...(override.paymentInfo || {}),
          },
        };
      }
    } catch (e) {
      console.warn('Error reading billing runtime override:', e);
    }
  }

  return baseConfig;
}

/**
 * Evalúa el estado de la suscripción y el modo solo lectura
 */
export function evaluateBillingStatus(customConfig = null) {
  const config = customConfig || getEffectiveBillingConfig();
  const nextBillingDate = config.nextBillingDate || '2026-11-28';
  const graceDays = Number(config.graceDays ?? 5);
  const reminderDaysBefore = Number(config.reminderDaysBefore ?? 3);
  const monthlyFee = Number(config.monthlyFee ?? 249);
  const currency = config.currency || 'MXN';

  const cancun = getCancunDateParts();
  const diffDays = getDiffDaysInCancun(nextBillingDate);

  const daysUntilDue = Math.max(0, diffDays);
  const daysPastDue = Math.max(0, -diffDays);

  let status = 'active'; // 'active' | 'reminder_window' | 'grace_period' | 'read_only'
  let canSendWhatsappOrder = true;
  let statusBadgeText = 'Suscripción Activa';
  let statusBadgeClass = 'is-active';
  let ownerAlert = null;

  if (diffDays > reminderDaysBefore) {
    status = 'active';
    canSendWhatsappOrder = true;
    statusBadgeText = `Al corriente (${daysUntilDue} días para corte)`;
    statusBadgeClass = 'is-active';
  } else if (diffDays >= 0 && diffDays <= reminderDaysBefore) {
    status = 'reminder_window';
    canSendWhatsappOrder = true;
    statusBadgeText = diffDays === 0 ? 'Corte el día de hoy' : `Próximo corte en ${diffDays} días`;
    statusBadgeClass = 'is-reminder';
    ownerAlert = {
      level: 'warning',
      title: 'Recordatorio Preventivo de Facturación',
      message: `Tu fecha de corte es el ${nextBillingDate}. Quedan ${diffDays} días para renovar tu suscripción sin interrupciones.`,
    };
  } else if (daysPastDue <= graceDays) {
    status = 'grace_period';
    canSendWhatsappOrder = true;
    const remainingGrace = graceDays - daysPastDue;
    statusBadgeText = `Periodo de Gracia (${remainingGrace} días restantes)`;
    statusBadgeClass = 'is-grace';
    ownerAlert = {
      level: 'danger',
      title: 'Pago Vencido - Periodo de Gracia Activo',
      message: `La fecha de corte venció hace ${daysPastDue} días. Cuentas con ${remainingGrace} días de gracia antes de que los pedidos a WhatsApp pasen a modo solo lectura.`,
    };
  } else {
    // daysPastDue > graceDays -> MODO SOLO LECTURA
    status = 'read_only';
    canSendWhatsappOrder = false;
    statusBadgeText = 'Modo Solo Consulta (Pedidos Pausados)';
    statusBadgeClass = 'is-readonly';
    ownerAlert = {
      level: 'critical',
      title: 'Modo Solo Lectura Activado',
      message: `Se han superado los ${graceDays} días de gracia posteriores al corte. El menú y QR continúan funcionando, pero el botón de WhatsApp ha sido pausado hasta registrar el pago.`,
    };
  }

  // Notificación amigable para el cliente final (sin exponer adeudos ni detalles internos)
  const customerNotice = !canSendWhatsappOrder
    ? {
        title: 'Menú solo consulta',
        message: 'Los pedidos por WhatsApp están pausados temporalmente. Consulta todos nuestros platillos y solicita tu comanda directamente al mesero.',
      }
    : null;

  return {
    timezone: TIMEZONE,
    todayCancun: cancun.dateStr,
    nextBillingDate,
    diffDays,
    daysUntilDue,
    daysPastDue,
    graceDays,
    reminderDaysBefore,
    monthlyFee,
    currency,
    status,
    canSendWhatsappOrder,
    isReminderDue: diffDays === reminderDaysBefore || (diffDays <= reminderDaysBefore && diffDays >= 0),
    statusBadgeText,
    statusBadgeClass,
    customerNotice,
    ownerAlert,
    billingPhone: config.billingPhone || config.whatsappRecipient,
    paymentInfo: config.paymentInfo || {},
    companyName: config.companyName,
    ownerPin: config.ownerPin,
  };
}

/**
 * Genera el cuerpo del recordatorio de WhatsApp para el dueño con formato profesional
 */
export function generateWhatsappReminderMessage(statusData = null) {
  const data = statusData || evaluateBillingStatus();
  const payment = data.paymentInfo || {};

  return (
    `*RECORDATORIO DE FACTURACIÓN — ${data.companyName || 'REDAYSOFT'}*\n` +
    `--------------------------------------------------\n` +
    `Hola, estimado/a administrador de *${BUSINESS_DATA.brand?.name || 'Cafetería María Bonita'}*.\n\n` +
    `Te informamos que tu fecha límite de pago para el servicio de menú digital es el *${data.nextBillingDate}*.\n\n` +
    `💵 *Monto de Mensualidad:* $${data.monthlyFee}.00 ${data.currency}\n` +
    `⏳ *Días restantes:* ${data.daysUntilDue} días\n` +
    `🛡️ *Periodo de Gracia:* ${data.graceDays} días adicionales tras vencimiento.\n\n` +
    `*DATOS PARA TRANSFERENCIA SPEI:*\n` +
    `🏦 *Banco:* ${payment.bank || 'BBVA'}\n` +
    `🔢 *CLABE Interbancaria:* \`${payment.clabe || '012180001234567890'}\`\n` +
    `👤 *Beneficiario:* ${payment.beneficiary || 'RedaySoft Soluciones'}\n` +
    `📌 *Concepto / Referencia:* \`${payment.reference || 'MARIA-BONITA-01'}\`\n\n` +
    `💳 *Pago Rápido en Línea:* ${payment.paymentLink || 'https://buy.stripe.com/test'}\n\n` +
    `_Una vez realizada tu transferencia, tu servicio se mantendrá activo sin interrupciones. ¡Muchas gracias por tu preferencia!_`
  );
}

/**
 * Renovar ciclo de facturación y avanzar fecha de corte (protegido con PIN)
 */
export function renewBillingCycle({ pin, monthsToAdd = 1 }) {
  const config = getEffectiveBillingConfig();
  if (String(pin).trim() !== String(config.ownerPin).trim()) {
    return { success: false, message: 'PIN de seguridad incorrecto.' };
  }

  const currentDate = config.nextBillingDate ? new Date(config.nextBillingDate + 'T12:00:00Z') : new Date();
  // Sumar mes(es)
  currentDate.setUTCMonth(currentDate.getUTCMonth() + monthsToAdd);

  const newYear = currentDate.getUTCFullYear();
  const newMonth = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
  const newDay = String(currentDate.getUTCDate()).padStart(2, '0');
  const newNextBillingDate = `${newYear}-${newMonth}-${newDay}`;

  const overrideData = {
    nextBillingDate: newNextBillingDate,
    lastPaymentDate: new Date().toISOString(),
    lastRenewedBy: 'owner_pin',
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(RUNTIME_OVERRIDE_KEY, JSON.stringify(overrideData));
    window.dispatchEvent(new CustomEvent('mb_billing_renewed', { detail: overrideData }));
  }

  return {
    success: true,
    newNextBillingDate,
    message: `Ciclo renovado exitosamente. Nueva fecha de corte: ${newNextBillingDate}`,
  };
}
