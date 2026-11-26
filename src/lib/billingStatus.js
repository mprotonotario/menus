import billingData from '../../data/billing.json';
import brandData from '../../data/brand.json';

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
  const baseConfig = billingData || {
    commissionPerOrder: 0,
    monthlyFee: 300,
    currency: 'MXN',
    cycleDays: 30,
    graceDays: 5,
    reminderDaysBefore: 5,
    paymentTiming: 'advance',
    firstMonthFree: true,
    serviceStartDate: '2026-11-01',
    billingCycleNumber: 2,
    paidMonthsCount: 0,
    nextBillingDate: '2026-12-01',
    billingPhone: '529831226847',
    whatsappRecipient: '529831226847',
    ownerPin: '2026',
    stripePublishableKey: 'pk_test_TYooMQauvdEDq54NiTphI7jx',
    companyName: 'RedaySoft Soluciones Digitales',
    supportEmail: 'soporte@redaysoft.com',
    paymentInfo: {
      bank: 'BBVA México',
      clabe: '012180001234567890',
      beneficiary: 'RedaySoft Soluciones Digitales',
      reference: 'CAFETERIA-DEMO-01',
      paymentLink: 'https://buy.stripe.com/test_cafeteria_demo_mensualidad',
      enablePaymentLink: false,
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
  const base = getEffectiveBillingConfig();
  const config = customConfig ? { ...base, ...customConfig } : base;
  const nextBillingDate = config.nextBillingDate || '2026-12-01';
  const graceDays = Number(config.graceDays ?? 5);
  const reminderDaysBefore = Number(config.reminderDaysBefore ?? 5);
  const monthlyFee = Number(config.monthlyFee ?? 300);
  const currency = config.currency || 'MXN';
  const firstMonthFree = Boolean(config.firstMonthFree ?? true);
  const paidMonthsCount = Number(config.paidMonthsCount ?? 0);
  const billingCycleNumber = Number(config.billingCycleNumber ?? (paidMonthsCount + (firstMonthFree ? 2 : 1)));
  const paymentTiming = config.paymentTiming || 'advance'; // 'advance': pago por adelantado para aperturar mes
  const isFirstPaidMonth = Boolean(firstMonthFree && paidMonthsCount === 0);

  const cancun = getCancunDateParts();
  const diffDays = getDiffDaysInCancun(nextBillingDate);

  const daysUntilDue = Math.max(0, diffDays);
  const daysPastDue = Math.max(0, -diffDays);

  // Bandera de Pausa Manual / Suspensión Administrativa
  const isSuspended = Boolean(config.isSuspended ?? config.isPlatformSuspended ?? false);

  let status = 'active'; // 'active' | 'reminder_window' | 'grace_period' | 'read_only' | 'suspended_by_admin'
  let canSendWhatsappOrder = true;
  let statusBadgeText = isFirstPaidMonth ? '1er Mes Gratis Concluido (Apertura Pendiente)' : 'Suscripción Activa';
  let statusBadgeClass = 'is-active';
  let ownerAlert = null;

  if (isSuspended) {
    // PAUSA MANUAL FORZADA POR ADMINISTRADOR
    status = 'suspended_by_admin';
    canSendWhatsappOrder = false;
    statusBadgeText = 'Plataforma Pausada Manualmente (Por Administrador)';
    statusBadgeClass = 'is-readonly';
    ownerAlert = {
      level: 'critical',
      title: 'Plataforma Pausada por Administrador',
      message: 'Has activado la bandera de suspensión manual. Los pedidos por WhatsApp se encuentran bloqueados hasta que reactives la plataforma.',
    };
  } else if (diffDays > reminderDaysBefore) {
    status = 'active';
    canSendWhatsappOrder = true;
    statusBadgeText = isFirstPaidMonth
      ? `Apertura 1er Mes de Cobro (${daysUntilDue} días para apertura)`
      : `Al corriente (${daysUntilDue} días para apertura de ciclo)`;
    statusBadgeClass = 'is-active';
  } else if (diffDays >= 0 && diffDays <= reminderDaysBefore) {
    status = 'reminder_window';
    canSendWhatsappOrder = true;
    if (isFirstPaidMonth) {
      statusBadgeText = diffDays === 0
        ? 'Apertura de 1er Mes de Cobro (Hoy)'
        : `Apertura de 1er Mes en ${diffDays} días`;
      statusBadgeClass = 'is-reminder';
      ownerAlert = {
        level: 'warning',
        title: '¡Bienvenido como Nuevo Cliente! — Apertura 1er Mes de Servicio',
        message: `Tu primer mes gratis de cortesía ha concluido. Para aperturar el nuevo periodo con servicio activo a partir del ${nextBillingDate}, realiza el pago por adelantado de $${monthlyFee}.00 ${currency} (quedan ${diffDays} días).`,
      };
    } else {
      statusBadgeText = diffDays === 0
        ? 'Apertura de nuevo mes el día de hoy'
        : `Apertura de nuevo mes en ${diffDays} días`;
      statusBadgeClass = 'is-reminder';
      ownerAlert = {
        level: 'warning',
        title: 'Recordatorio Preventivo: Apertura de Mes por Adelantado',
        message: `La fecha de apertura para tu nuevo periodo es el ${nextBillingDate}. Quedan ${diffDays} días para realizar tu pago anticipado de $${monthlyFee}.00 ${currency} y continuar sin interrupciones.`,
      };
    }
  } else if (daysPastDue <= graceDays) {
    status = 'grace_period';
    canSendWhatsappOrder = true;
    const remainingGrace = graceDays - daysPastDue;
    statusBadgeText = `Periodo de Gracia (${remainingGrace} días restantes)`;
    statusBadgeClass = 'is-grace';
    ownerAlert = {
      level: 'danger',
      title: 'Pago Anticipado Pendiente - Periodo de Gracia Activo',
      message: `La fecha de apertura del mes venció hace ${daysPastDue} días. Cuentas con ${remainingGrace} días de gracia para regularizar la mensualidad antes de que los pedidos a WhatsApp pasen a modo solo lectura.`,
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
      message: `Se han superado los ${graceDays} días de gracia posteriores a la fecha de apertura. El menú y QR continúan visibles, pero el botón de WhatsApp ha sido pausado hasta registrar el pago del periodo.`,
    };
  }

  // Notificación amigable para el cliente final (sin exponer adeudos ni detalles internos)
  const customerNotice = !canSendWhatsappOrder
    ? {
        title: config.customerNoticeTitle || 'Menú solo consulta',
        message:
          config.customerNoticeMessage ||
          'Los pedidos por WhatsApp se encuentran pausados temporalmente. Puedes revisar todo nuestro menú y ordenar directamente con el personal en nuestro establecimiento.',
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
    isSuspended,
    firstMonthFree,
    paidMonthsCount,
    billingCycleNumber,
    paymentTiming,
    isFirstPaidMonth,
    billingPhone: config.billingPhone || config.whatsappRecipient,
    paymentInfo: config.paymentInfo || {},
    companyName: config.companyName,
    ownerPin: config.ownerPin,
    telegramAdmin: config.telegramAdmin || {},
  };
}

/**
 * Genera el mensaje formateado en HTML para el Administrador vía Telegram Bot
 */
export function generateTelegramAdminNotification(statusData = null, directWhatsappUrl = '') {
  const data = statusData || evaluateBillingStatus();
  const payment = data.paymentInfo || {};
  const businessName = brandData.brand?.name || brandData.name || 'Cafetería Demo';
  const phone = data.billingPhone || '529831226847';

  const titleHeader = data.isFirstPaidMonth
    ? `🎉 <b>NOTIFICACIÓN DE COBRO: 1ER MES (BIENVENIDA NUEVO CLIENTE)</b>`
    : `🔔 <b>RECORDATORIO DE FACTURACIÓN (APERTURA DE MES POR ADELANTADO)</b>`;

  const cycleInfo = data.isFirstPaidMonth
    ? `🎁 <b>Condición:</b> 1er Mes de Cortesía Concluido → Inicio de Cobro Formal\n`
    : `🔄 <b>Ciclo de Servicio:</b> Mes #${data.billingCycleNumber || 2} (Mensualidad Recurrente)\n`;

  const text = 
    `${titleHeader}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🏪 <b>Restaurante:</b> <code>${businessName}</code>\n` +
    cycleInfo +
    `📅 <b>Apertura de Periodo:</b> <code>${data.nextBillingDate}</code> (Faltan <b>${data.daysUntilDue} días</b>)\n` +
    `💵 <b>Monto por Adelantado:</b> <b>$${data.monthlyFee}.00 ${data.currency}</b>\n` +
    `📱 <b>Teléfono Cliente:</b> <code>+${phone}</code>\n` +
    `🛡️ <b>Gracia:</b> <code>${data.graceDays} días</code> antes de pausar pedidos\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👉 <i>Presiona el botón inferior para abrir WhatsApp con el mensaje ${data.isFirstPaidMonth ? 'de bienvenida y cobro inicial' : 'oficial de pago'} listo para enviárselo al cliente.</i>`;

  const inlineKeyboard = [
    [
      {
        text: '📲 Abrir WhatsApp del Cliente',
        url: directWhatsappUrl || `https://wa.me/${phone}`,
      },
    ],
  ];

  if (payment.enablePaymentLink === true && payment.paymentLink) {
    inlineKeyboard.push([
      {
        text: '💳 Ver Pasarela Stripe',
        url: payment.paymentLink,
      },
    ]);
  }

  return { text, inlineKeyboard };
}

/**
 * Envía notificación a Telegram Bot usando la API oficial
 */
export async function sendTelegramAdminNotification({ botToken, chatId, text, inlineKeyboard }) {
  if (!botToken || !chatId) {
    return {
      success: false,
      error: 'Faltan credenciales de Telegram (TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID)',
    };
  }

  const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
      disable_web_page_preview: false,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.ok) {
    return {
      success: false,
      error: result.description || `HTTP Error ${response.status}`,
      details: result,
    };
  }

  return {
    success: true,
    messageId: result.result?.message_id,
  };
}

/**
 * Genera el cuerpo del recordatorio de WhatsApp para el dueño con formato profesional
 */
export function generateWhatsappReminderMessage(statusData = null) {
  const data = statusData || evaluateBillingStatus();
  const payment = data.paymentInfo || {};
  const isOnlinePaymentEnabled = payment.enablePaymentLink === true && Boolean(payment.paymentLink);
  const businessName = brandData.brand?.name || brandData.name || 'Cafetería Demo';
  const company = data.companyName || 'RedaySoft Soluciones Digitales';

  if (data.isFirstPaidMonth) {
    // MENSAJE DE BIENVENIDA COMO NUEVO CLIENTE (1ER MES DE COBRO TRAS MES GRATIS)
    let message =
      `🎉 *¡BIENVENIDO A REDAYSOFT! — APERTURA DE SERVICIO MENSUAL* 🎉\n` +
      `--------------------------------------------------\n` +
      `Estimado/a administrador de *${businessName}*:\n\n` +
      `Esperamos que hayan tenido una excelente experiencia con su *primer mes de cortesía gratuito* en nuestra plataforma de Menú Digital interactivo.\n\n` +
      `Nos da un gran gusto darles la más cordial *bienvenida como cliente formal* de ${company}. A partir de este momento, iniciamos formalmente la modalidad de mensualidad con cuota fija preferencial.\n\n` +
      `Recordamos que el servicio opera con la modalidad de *pago por adelantado para aperturar el mes de uso*. A continuación les compartimos los detalles para la apertura de su periodo que inicia el *${data.nextBillingDate}*:\n\n` +
      `💎 *Concepto:* Apertura 1er Mes de Servicio (Menú Digital & Pedidos WhatsApp)\n` +
      `💵 *Monto de Mensualidad:* $${data.monthlyFee}.00 ${data.currency} (Cuota Fija)\n` +
      `📅 *Fecha de Apertura / Límite:* ${data.nextBillingDate} (Faltan ${data.daysUntilDue} días)\n` +
      `🛡️ *Periodo de Gracia:* ${data.graceDays} días adicionales tras la fecha de apertura.\n\n` +
      `*DATOS PARA TRANSFERENCIA BANCARIA SPEI:*\n` +
      `🏦 *Banco:* ${payment.bank || 'BBVA México'}\n` +
      `🔢 *CLABE Interbancaria:* \`${payment.clabe || '012180001234567890'}\`\n` +
      `👤 *Beneficiario:* ${payment.beneficiary || 'RedaySoft Soluciones Digitales'}\n` +
      `📌 *Concepto / Referencia:* \`${payment.reference || 'CAFETERIA-DEMO-01'}\`\n\n`;

    if (isOnlinePaymentEnabled) {
      message += `💳 *Pago Rápido con Tarjeta:* ${payment.paymentLink}\n\n`;
    }

    message +=
      `📸 *Apertura y Confirmación de Pago:*\n` +
      `Una vez realizada su transferencia, por favor *compartan su comprobante o captura de pantalla por este mismo chat de WhatsApp* para registrar el abono, dar apertura inmediata a su ciclo y hacerles llegar su recibo correspondiente.\n\n` +
      `_¡Agradecemos enormemente su confianza y estamos listos para seguir impulsando las ventas y pedidos de su cafetería!_`;

    return message;
  }

  // MENSAJE RECURRENTE ESTÁNDAR (A PARTIR DEL SEGUNDO MES CON COBRO EN ADELANTE)
  let message =
    `*RECORDATORIO DE MENSUALIDAD — ${company}*\n` +
    `--------------------------------------------------\n` +
    `Hola, estimado/a administrador de *${businessName}*.\n\n` +
    `Te recordamos que se aproxima la fecha para aperturar tu siguiente mes de servicio de menú digital el *${data.nextBillingDate}*.\n\n` +
    `Como sabes, nuestros pagos son *por adelantado cada vez que inicia el mes* para aperturar el periodo de uso y mantener activos tus pedidos sin interrupciones.\n\n` +
    `💵 *Monto de Mensualidad:* $${data.monthlyFee}.00 ${data.currency}\n` +
    `📅 *Fecha de Apertura / Corte:* ${data.nextBillingDate}\n` +
    `⏳ *Días restantes:* ${data.daysUntilDue} días\n` +
    `🛡️ *Periodo de Gracia:* ${data.graceDays} días adicionales tras la fecha.\n\n` +
    `*DATOS PARA TRANSFERENCIA SPEI:*\n` +
    `🏦 *Banco:* ${payment.bank || 'BBVA México'}\n` +
    `🔢 *CLABE Interbancaria:* \`${payment.clabe || '012180001234567890'}\`\n` +
    `👤 *Beneficiario:* ${payment.beneficiary || 'RedaySoft Soluciones Digitales'}\n` +
    `📌 *Concepto / Referencia:* \`${payment.reference || 'CAFETERIA-DEMO-01'}\`\n\n`;

  if (isOnlinePaymentEnabled) {
    message += `💳 *Pago Rápido en Línea:* ${payment.paymentLink}\n\n`;
  }

  message +=
    `📸 *Confirmación de Pago:*\n` +
    `Una vez realizada tu transferencia, por favor *comparte tu comprobante o captura de pago por este mismo medio* para aperturar tu nuevo ciclo y mantener tus pedidos de WhatsApp funcionando con normalidad.\n\n` +
    `_¡Agradecemos mucho tu confianza y preferencia continua!_`;

  return message;
}

/**
 * Renovar ciclo de facturación y avanzar fecha de corte (protegido con PIN)
 */
export function renewBillingCycle({ pin, monthsToAdd = 1 }) {
  const config = getEffectiveBillingConfig();
  if (String(pin).trim() !== String(config.ownerPin).trim()) {
    return { success: false, message: 'PIN de seguridad incorrecto.' };
  }

  // Avanzar fecha de corte asegurando el 1ro del mes siguiente
  let newNextBillingDate;
  if (config.nextBillingDate) {
    const [y, m] = config.nextBillingDate.split('-').map(Number);
    const targetDate = new Date(Date.UTC(y, m - 1 + monthsToAdd, 1));
    const newYear = targetDate.getUTCFullYear();
    const newMonth = String(targetDate.getUTCMonth() + 1).padStart(2, '0');
    newNextBillingDate = `${newYear}-${newMonth}-01`;
  } else {
    const now = new Date();
    const targetDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() + monthsToAdd, 1));
    const newYear = targetDate.getUTCFullYear();
    const newMonth = String(targetDate.getUTCMonth() + 1).padStart(2, '0');
    newNextBillingDate = `${newYear}-${newMonth}-01`;
  }

  const newPaidMonthsCount = (config.paidMonthsCount || 0) + monthsToAdd;
  const newBillingCycleNumber = (config.billingCycleNumber || 2) + monthsToAdd;

  const overrideData = {
    nextBillingDate: newNextBillingDate,
    paidMonthsCount: newPaidMonthsCount,
    billingCycleNumber: newBillingCycleNumber,
    lastPaymentDate: new Date().toISOString(),
    lastRenewedBy: 'owner_pin',
    isSuspended: false, // Reactiva automáticamente la plataforma al registrar pago
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(RUNTIME_OVERRIDE_KEY, JSON.stringify(overrideData));
    window.dispatchEvent(new CustomEvent('mb_billing_renewed', { detail: overrideData }));
  }

  return {
    success: true,
    newNextBillingDate,
    newPaidMonthsCount,
    newBillingCycleNumber,
    message: `Ciclo renovado exitosamente. Apertura del siguiente mes: ${newNextBillingDate}`,
  };
}

/**
 * Activar o desactivar la suspensión manual de la plataforma (Modo Solo Lectura)
 */
export function setPlatformSuspension({ pin, suspend = true }) {
  const config = getEffectiveBillingConfig();
  if (String(pin).trim() !== String(config.ownerPin).trim()) {
    return { success: false, message: 'PIN de seguridad incorrecto.' };
  }

  let existing = {};
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(RUNTIME_OVERRIDE_KEY);
      if (raw) existing = JSON.parse(raw);
    } catch {}
  }

  const overrideData = {
    ...existing,
    isSuspended: Boolean(suspend),
    lastSuspensionChangedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(RUNTIME_OVERRIDE_KEY, JSON.stringify(overrideData));
    window.dispatchEvent(new CustomEvent('mb_billing_renewed', { detail: overrideData }));
  }

  return {
    success: true,
    isSuspended: Boolean(suspend),
    message: suspend
      ? '🛑 Plataforma pausada exitosamente. Los pedidos por WhatsApp han sido bloqueados.'
      : '▶️ Plataforma reactivada exitosamente. Los pedidos por WhatsApp vuelven a estar activos.',
  };
}
