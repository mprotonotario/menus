/**
 * Menú Digital & Configuración Modularizada
 * Los datos se encuentran estructurados y desacoplados en la carpeta /data/:
 * - data/categories.json (Categorías del menú)
 * - data/products.json (Platillos, precios, imágenes, opciones)
 * - data/brand.json (Identidad de marca, hero, títulos)
 * - data/location.json (Dirección, horarios, estado abierto/cerrado)
 * - data/contact.json (Teléfonos, WhatsApp, correo, redes)
 * - data/about.json (Nuestra historia, métricas, valores)
 * - data/billing.json (Facturación, comisiones, corte, PIN)
 */

import categoriesData from '../../data/categories.json';
import productsData from '../../data/products.json';
import brandData from '../../data/brand.json';
import locationData from '../../data/location.json';
import contactData from '../../data/contact.json';
import aboutData from '../../data/about.json';
import billingData from '../../data/billing.json';

const MENU_CATEGORIES = categoriesData;
const MENU_ITEMS = productsData;

const BUSINESS_DATA = {
  brand: brandData.brand || {},
  hero: brandData.hero || {},
  name: brandData.name || brandData.brand?.name || 'Cafetería María Bonita',
  tradeName: brandData.tradeName || brandData.brand?.tradeName || 'María Bonita Cafetería & Panadería',
  slogan: brandData.slogan || brandData.brand?.slogan || '',
  subheadline: brandData.subheadline || brandData.brand?.subheadline || '',
  location: locationData.location || {},
  mapPin: locationData.mapPin || {},
  hours: locationData.hours || [],
  scheduleStatus: locationData.scheduleStatus || { mode: 'auto' },
  topNotice: locationData.topNotice || {},
  contact: contactData.contact || {},
  socials: contactData.socials || {},
  paymentConfig: contactData.paymentConfig || { allowTransfer: true, allowCash: true },
  stats: aboutData.stats || [],
  platformBilling: billingData || {},
};

// Objeto para compatibilidad total con código existente
const CAFE_INFO = {
  ...BUSINESS_DATA,
  phone: BUSINESS_DATA.contact?.phoneDisplay,
  whatsapp: BUSINESS_DATA.contact?.whatsappNumber,
  whatsappDisplay: BUSINESS_DATA.contact?.phoneDisplay,
  email: BUSINESS_DATA.contact?.email,
  address: BUSINESS_DATA.location?.address,
  reference: BUSINESS_DATA.location?.reference,
  hours: BUSINESS_DATA.hours,
  stats: BUSINESS_DATA.stats,
  socials: BUSINESS_DATA.socials,
};

// Exposición global para depuración o consumo dinámico
if (typeof window !== 'undefined') {
  window.BUSINESS_DATA = BUSINESS_DATA;
  window.CAFE_INFO = CAFE_INFO;
}

export function formatMoney(amount) {
  if (typeof amount !== 'number') return '$0.00';
  return '$' + amount.toFixed(2);
}

export function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const cleaned = timeStr.trim().toLowerCase();

  // Caso 1: formato 24 horas "HH:MM" (ej. "06:00", "22:00")
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    return h * 60 + m;
  }

  // Caso 2: formato 12 horas con am/pm (ej. "6:00 am", "10:00 pm", "06:00am")
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const ampm = match12[3].toLowerCase();
    if (ampm === 'pm' && h < 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    return h * 60 + m;
  }

  return null;
}

export function isScheduleForDay(hourItem, dayOfWeek) {
  if (!hourItem) return false;

  // 1. Verificación por dayIndices explícitos [0, 1, 2, 3, 4, 5, 6] (prioritaria)
  if (Array.isArray(hourItem.dayIndices) && hourItem.dayIndices.length > 0) {
    return hourItem.dayIndices.includes(dayOfWeek);
  }

  // 2. Verificación por texto descriptivo en `days`
  if (!hourItem.days) return false;
  const daysStr = hourItem.days.toLowerCase().trim();

  if (daysStr.includes('todos') || daysStr.includes('diario') || daysStr.includes('lunes a domingo')) return true;
  if (daysStr.includes('fin de semana') && (dayOfWeek === 0 || dayOfWeek === 6)) return true;
  if (daysStr.includes('lunes a jueves') && dayOfWeek >= 1 && dayOfWeek <= 4) return true;
  if (daysStr.includes('lunes a viernes') && dayOfWeek >= 1 && dayOfWeek <= 5) return true;
  if ((daysStr.includes('lunes a sábado') || daysStr.includes('lunes a sabado')) && dayOfWeek >= 1 && dayOfWeek <= 6) return true;
  if (daysStr.includes('martes a domingo') && (dayOfWeek >= 2 || dayOfWeek === 0)) return true;
  if (daysStr.includes('viernes a domingo') && (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0)) return true;
  if ((daysStr.includes('sábado y domingo') || daysStr.includes('sabado y domingo')) && (dayOfWeek === 6 || dayOfWeek === 0)) return true;

  if (dayOfWeek === 1 && daysStr.includes('lunes')) return true;
  if (dayOfWeek === 2 && daysStr.includes('martes')) return true;
  if (dayOfWeek === 3 && (daysStr.includes('miércoles') || daysStr.includes('miercoles'))) return true;
  if (dayOfWeek === 4 && daysStr.includes('jueves')) return true;
  if (dayOfWeek === 5 && daysStr.includes('viernes')) return true;
  if (dayOfWeek === 6 && (daysStr.includes('sábado') || daysStr.includes('sabado') || daysStr.includes('sábados'))) return true;
  if (dayOfWeek === 0 && (daysStr.includes('domingo') || daysStr.includes('domingos'))) return true;

  return false;
}

export function computeLiveBusinessStatus(hoursOrBusinessData) {
  let hoursList = [];
  let scheduleConfig = {};

  if (Array.isArray(hoursOrBusinessData)) {
    hoursList = hoursOrBusinessData;
  } else if (hoursOrBusinessData && typeof hoursOrBusinessData === 'object') {
    hoursList = hoursOrBusinessData.hours || [];
    scheduleConfig = hoursOrBusinessData.scheduleStatus || {};
  }

  // 1. Modo Forzado Manual si se configura en location.json
  const mode = (scheduleConfig.mode || 'auto').toLowerCase();
  if (mode === 'open') {
    return {
      isOpen: true,
      badgeText: scheduleConfig.openBadgePrefix || 'Abierto Ahora',
      cssClass: 'is-open',
      closingText: 'Servicio activo',
    };
  }
  if (mode === 'closed') {
    return {
      isOpen: false,
      badgeText: scheduleConfig.closedBadgePrefix || 'Cerrado Ahora',
      cssClass: 'is-closed',
      closingText: 'Cerrado temporalmente',
    };
  }

  if (!hoursList || !Array.isArray(hoursList) || hoursList.length === 0) {
    return {
      isOpen: true,
      badgeText: 'Abierto Hoy: 6:00 am - 10:00 pm',
      cssClass: 'is-open',
      closingText: 'Servicio activo',
    };
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todaySchedule = hoursList.find((h) => isScheduleForDay(h, currentDay));

  if (!todaySchedule || (todaySchedule.time && todaySchedule.time.toLowerCase().includes('cerrado'))) {
    return {
      isOpen: false,
      badgeText: 'Cerrado Hoy',
      cssClass: 'is-closed',
      closingText: 'Hoy nos encontramos descansando',
    };
  }

  // Obtener minutos de apertura y cierre
  let openMin = null;
  let closeMin = null;

  if (todaySchedule.open) openMin = parseTimeToMinutes(todaySchedule.open);
  if (todaySchedule.close) closeMin = parseTimeToMinutes(todaySchedule.close);

  if (openMin === null || closeMin === null) {
    const match = todaySchedule.time?.match(/(\d{1,2}):(\d{2})\s*(am|pm)?\s*[-–a]\s*(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    if (match) {
      let openH = parseInt(match[1], 10);
      const openM = parseInt(match[2], 10);
      const openAmpm = match[3] ? match[3].toLowerCase() : null;

      let closeH = parseInt(match[4], 10);
      const closeM = parseInt(match[5], 10);
      const closeAmpm = match[6] ? match[6].toLowerCase() : null;

      if (openAmpm === 'pm' && openH < 12) openH += 12;
      if (openAmpm === 'am' && openH === 12) openH = 0;
      if (closeAmpm === 'pm' && closeH < 12) closeH += 12;
      if (closeAmpm === 'am' && closeH === 12) closeH = 0;

      openMin = openH * 60 + openM;
      closeMin = closeH * 60 + closeM;
    }
  }

  if (openMin !== null && closeMin !== null) {
    let isOpen = false;
    if (closeMin > openMin) {
      isOpen = currentMinutes >= openMin && currentMinutes < closeMin;
    } else {
      // Horarios cruzando medianoche
      isOpen = currentMinutes >= openMin || currentMinutes < closeMin;
    }

    const openPrefix = scheduleConfig.openBadgePrefix || 'Abierto Hoy:';
    const closedPrefix = scheduleConfig.closedBadgePrefix || 'Cerrado ahora';

    return {
      isOpen,
      badgeText: isOpen ? `${openPrefix} ${todaySchedule.time}` : `${closedPrefix} • ${todaySchedule.time}`,
      cssClass: isOpen ? 'is-open' : 'is-closed',
      closingText: isOpen ? `Abierto hasta las ${todaySchedule.time.split(/[-–]/)[1]?.trim() || ''}` : 'Cerrado en este momento',
    };
  }

  return {
    isOpen: true,
    badgeText: `Abierto Hoy: ${todaySchedule.time}`,
    cssClass: 'is-open',
    closingText: 'Servicio activo',
  };
}

export {
  BUSINESS_DATA,
  CAFE_INFO,
  MENU_CATEGORIES,
  MENU_ITEMS,
};
