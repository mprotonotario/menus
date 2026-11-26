import fs from 'fs';
import path from 'path';

const TIMEZONE = 'America/Cancun';

/**
 * Obtiene la fecha y hora actual en zona horaria America/Cancun
 */
export function getCancunTimestamp(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('es-MX', {
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
  const map = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });

  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
}

/**
 * Extrae y limpia la IP pública del cliente a partir de headers comunes de proxy y servidor
 */
export function extractClientIp(headers) {
  let ip = null;

  const getHeader = (name) => {
    if (!headers) return null;
    if (typeof headers.get === 'function') return headers.get(name);
    return headers[name] || headers[name.toLowerCase()] || null;
  };

  const forwarded = getHeader('x-forwarded-for');
  if (forwarded) {
    // Si viene una lista separada por comas "client, proxy1, proxy2", la primera es la IP del cliente real
    ip = forwarded.split(',')[0].trim();
  }

  if (!ip || ip === 'unknown') ip = getHeader('cf-connecting-ip'); // Cloudflare
  if (!ip || ip === 'unknown') ip = getHeader('x-real-ip'); // Nginx / Traefik
  if (!ip || ip === 'unknown') ip = getHeader('x-client-ip');
  if (!ip || ip === 'unknown') ip = getHeader('fastly-client-ip');
  if (!ip || ip === 'unknown') ip = getHeader('true-client-ip');

  if (!ip) ip = '127.0.0.1';

  // Normalizar IPv4 mapeada en IPv6 ej: ::ffff:192.168.1.1
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  return ip;
}

/**
 * Analiza el User-Agent para clasificar el dispositivo, sistema operativo y navegador
 */
export function parseUserAgent(ua = '') {
  const raw = String(ua || '').trim();
  const uaLower = raw.toLowerCase();

  let deviceType = 'Computadora (Escritorio)';
  let os = 'Desconocido';
  let browser = 'Desconocido';

  // 1. Tipo de Dispositivo
  if (/ipad|tablet|playbook|silk/i.test(raw)) {
    deviceType = 'Tablet';
  } else if (/mobile|iphone|ipod|android.*mobile|blackberry|bb10|phone|opera mini|iemobile/i.test(raw)) {
    deviceType = 'Móvil (Smartphone)';
  } else if (/bot|crawler|spider|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot/i.test(raw)) {
    deviceType = 'Bot / Rastreador';
  } else {
    deviceType = 'Computadora (Escritorio)';
  }

  // 2. Sistema Operativo
  if (/windows/i.test(raw)) {
    if (/windows nt 10/i.test(raw)) os = 'Windows 10/11';
    else if (/windows nt 6.3/i.test(raw)) os = 'Windows 8.1';
    else if (/windows nt 6.1/i.test(raw)) os = 'Windows 7';
    else os = 'Windows';
  } else if (/iphone/i.test(raw)) {
    os = 'iOS (iPhone)';
  } else if (/ipad/i.test(raw)) {
    os = 'iPadOS';
  } else if (/android/i.test(raw)) {
    const match = raw.match(/android\s+([\d.]+)/i);
    os = match ? `Android ${match[1]}` : 'Android';
  } else if (/macintosh|mac os x/i.test(raw)) {
    os = 'macOS';
  } else if (/linux/i.test(raw)) {
    os = 'Linux';
  }

  // 3. Navegador / Aplicación
  if (/whatsapp/i.test(raw)) {
    browser = 'WhatsApp In-App';
  } else if (/instagram/i.test(raw)) {
    browser = 'Instagram In-App';
  } else if (/fbav|fban/i.test(raw)) {
    browser = 'Facebook In-App';
  } else if (/edg/i.test(raw)) {
    browser = 'Microsoft Edge';
  } else if (/opr|opera/i.test(raw)) {
    browser = 'Opera';
  } else if (/chrome|crios/i.test(raw) && !/edg|opr/i.test(raw)) {
    browser = 'Google Chrome';
  } else if (/safari/i.test(raw) && !/chrome|crios|android/i.test(raw)) {
    browser = 'Apple Safari';
  } else if (/firefox|fxios/i.test(raw)) {
    browser = 'Mozilla Firefox';
  } else if (/bot|crawl/i.test(raw)) {
    browser = 'Web Crawler';
  }

  return {
    deviceType,
    os,
    browser,
    summary: `${deviceType} | ${os} (${browser})`,
  };
}

/**
 * Registra o actualiza el acceso de una IP en el archivo logs/visitors.log
 */
export function recordVisitorAccess({ ip, userAgent, pathVisited = '/' }) {
  if (!ip) return null;

  const logDir = path.join(process.cwd(), 'logs');
  const logFilePath = path.join(logDir, 'visitors.log');
  const storeFilePath = path.join(logDir, '.visitors_store.json');

  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true });
    } catch (e) {
      console.warn('Error al crear directorio logs:', e);
    }
  }

  // 1. Cargar almacén existente de IPs únicas
  let visitorsMap = {};
  if (fs.existsSync(storeFilePath)) {
    try {
      const raw = fs.readFileSync(storeFilePath, 'utf8');
      visitorsMap = JSON.parse(raw);
    } catch (e) {
      visitorsMap = {};
    }
  }

  const nowCancun = getCancunTimestamp();
  const uaParsed = parseUserAgent(userAgent);

  const isExisting = Boolean(visitorsMap[ip]);

  if (isExisting) {
    // Si la IP ya existía: ACTUALIZAR fecha, hora, visitas y dispositivo actual
    visitorsMap[ip] = {
      ...visitorsMap[ip],
      lastVisit: nowCancun,
      deviceType: uaParsed.deviceType,
      os: uaParsed.os,
      browser: uaParsed.browser,
      deviceSummary: uaParsed.summary,
      totalVisits: (visitorsMap[ip].totalVisits || 1) + 1,
      lastPath: pathVisited || visitorsMap[ip].lastPath || '/',
    };
  } else {
    // Si es nueva IP: crear entrada
    visitorsMap[ip] = {
      ip,
      firstVisit: nowCancun,
      lastVisit: nowCancun,
      deviceType: uaParsed.deviceType,
      os: uaParsed.os,
      browser: uaParsed.browser,
      deviceSummary: uaParsed.summary,
      totalVisits: 1,
      lastPath: pathVisited || '/',
    };
  }

  // 2. Guardar almacén interno
  try {
    fs.writeFileSync(storeFilePath, JSON.stringify(visitorsMap, null, 2), 'utf8');
  } catch (e) {
    console.warn('Error al guardar .visitors_store.json:', e);
  }

  // 3. Generar y escribir el archivo limpio logs/visitors.log
  try {
    const list = Object.values(visitorsMap).sort((a, b) => {
      // Ordenar por última visita descendente (la más reciente arriba)
      return (b.lastVisit || '').localeCompare(a.lastVisit || '');
    });

    let logContent =
      `========================================================================================================================\n` +
      `BITÁCORA DE ACCESOS POR IP PÚBLICA — MENÚ DIGITAL\n` +
      `Zona Horaria: ${TIMEZONE} | Total de IPs Únicas Registradas: ${list.length}\n` +
      `Última actualización de la bitácora: ${nowCancun}\n` +
      `Regla: Si una IP ya había ingresado previamente, se actualiza su fecha, hora y dispositivo sin duplicar líneas.\n` +
      `========================================================================================================================\n\n`;

    list.forEach((item, index) => {
      const num = String(index + 1).padStart(3, '0');
      logContent +=
        `[#${num}] IP: ${item.ip}\n` +
        `       Última Entrada : ${item.lastVisit} (Cancún)\n` +
        `       Dispositivo    : ${item.deviceType}\n` +
        `       Sistema/Browser: ${item.os} — ${item.browser}\n` +
        `       Total Visitas  : ${item.totalVisits} visita(s)\n` +
        `       Primera Entrada: ${item.firstVisit}\n` +
        `       Última Sección : ${item.lastPath}\n` +
        `------------------------------------------------------------------------------------------------------------------------\n`;
    });

    fs.writeFileSync(logFilePath, logContent, 'utf8');
  } catch (e) {
    console.warn('Error al escribir visitors.log:', e);
  }

  return visitorsMap[ip];
}

/**
 * Obtiene las estadísticas agregadas y la lista ordenada de visitantes para el panel /admin
 */
export function getVisitorsStats() {
  const logDir = path.join(process.cwd(), 'logs');
  const storeFilePath = path.join(logDir, '.visitors_store.json');
  const logFilePath = path.join(logDir, 'visitors.log');

  let visitorsMap = {};
  if (fs.existsSync(storeFilePath)) {
    try {
      const raw = fs.readFileSync(storeFilePath, 'utf8');
      visitorsMap = JSON.parse(raw);
    } catch (e) {
      visitorsMap = {};
    }
  }

  const list = Object.values(visitorsMap).sort((a, b) => {
    return (b.lastVisit || '').localeCompare(a.lastVisit || '');
  });

  const totalIps = list.length;
  const totalVisits = list.reduce((sum, item) => sum + (Number(item.totalVisits) || 1), 0);

  let mobileCount = 0;
  let desktopCount = 0;
  let tabletCount = 0;
  let botCount = 0;

  list.forEach((item) => {
    const d = (item.deviceType || '').toLowerCase();
    if (d.includes('móvil') || d.includes('movil') || d.includes('smartphone')) mobileCount++;
    else if (d.includes('computadora') || d.includes('escritorio')) desktopCount++;
    else if (d.includes('tablet')) tabletCount++;
    else if (d.includes('bot')) botCount++;
    else desktopCount++;
  });

  const mobilePercent = totalIps > 0 ? Math.round((mobileCount / totalIps) * 100) : 0;
  const desktopPercent = totalIps > 0 ? Math.round((desktopCount / totalIps) * 100) : 0;
  const tabletPercent = totalIps > 0 ? Math.round((tabletCount / totalIps) * 100) : 0;

  return {
    totalIps,
    totalVisits,
    mobileCount,
    desktopCount,
    tabletCount,
    botCount,
    mobilePercent,
    desktopPercent,
    tabletPercent,
    lastUpdate: list[0]?.lastVisit || null,
    visitors: list,
    logFileExists: fs.existsSync(logFilePath),
  };
}
