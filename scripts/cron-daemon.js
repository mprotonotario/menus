/**
 * Demonio de Cron Autónomo para Facturación y Recordatorios por WhatsApp
 * Se ejecuta dentro del entorno Docker sin dependencias externas.
 */

const TARGET_URL = (process.env.MENUS_APP_URL || 'http://menus-app:3000').replace(/\/$/, '');
const CRON_SECRET = process.env.CRON_SECRET || 'cron_secret_maria_bonita_2026';
const TIMEZONE = process.env.TZ || 'America/Cancun';
const SCHEDULED_HOUR = parseInt(process.env.RUN_AT_HOUR_CANCUN || '9', 10);
const SCHEDULED_MINUTE = parseInt(process.env.RUN_AT_MINUTE_CANCUN || '0', 10);

function getNowInCancun() {
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

  const parts = formatter.formatToParts(new Date());
  const map = {};
  for (const p of parts) map[p.type] = p.value;

  return {
    dateStr: `${map.year}-${map.month}-${map.day}`,
    timeStr: `${map.hour}:${map.minute}:${map.second}`,
    hour: parseInt(map.hour, 10),
    minute: parseInt(map.minute, 10),
    second: parseInt(map.second, 10),
    full: `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`,
  };
}

let lastExecutedDate = null;

async function executeCronBilling(isStartupCheck = false) {
  const now = getNowInCancun();
  const label = isStartupCheck ? 'VERIFICACIÓN DE ARRANQUE' : 'EJECUCIÓN DIARIA PROGRAMADA';
  
  console.log(`\n======================================================================`);
  console.log(`[Billing-Cron] ⏰ [${now.full} Cancún] Ejecutando: ${label}`);
  console.log(`[Billing-Cron] Destino: ${TARGET_URL}/api/billing/cron`);
  
  try {
    const url = `${TARGET_URL}/api/billing/cron?secret=${encodeURIComponent(CRON_SECRET)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Docker-Internal-Billing-Cron/1.0',
        'x-cron-secret': CRON_SECRET,
      },
    });

    const status = res.status;
    const data = await res.json().catch(() => ({}));

    if (status === 200) {
      const billing = data.billing || {};
      console.log(`[Billing-Cron] ✅ Petición exitosa (HTTP 200)`);
      console.log(`[Billing-Cron] 📊 Estado del ciclo en Cancún:`, {
        fechaCancun: data.cancunDate,
        proximoCorte: billing.nextBillingDate,
        diasParaCorte: billing.daysUntilDue ?? billing.daysRemaining,
        estado: billing.status,
        pedidosActivos: billing.canSendWhatsappOrder,
        recordatorioEnviado: data.reminderDispatched || data.alreadySentToday,
      });

      if (data.reminderDispatched || data.alreadySentToday) {
        console.log(`[Billing-Cron] 📲 ¡AVISO PROCESADO!: Recordatorio de cobro generado (Método: ${data.dispatchMethod || 'wa.me url'}).`);
      }
      if (data.reason) {
        console.log(`[Billing-Cron] ℹ️ Motivo: ${data.reason}`);
      }

      if (!isStartupCheck) {
        lastExecutedDate = now.dateStr;
      }
    } else {
      console.error(`[Billing-Cron] ❌ El endpoint respondió con código de error HTTP ${status}:`, data);
    }
  } catch (err) {
    console.error(`[Billing-Cron] ⚠️ Error de conexión con ${TARGET_URL}: ${err.message}`);
    if (isStartupCheck) {
      console.log(`[Billing-Cron] Reintentando conexión en 10 segundos...`);
      setTimeout(() => executeCronBilling(true), 10000);
    }
  }
  console.log(`======================================================================\n`);
}

function startSchedulerLoop() {
  console.log(`\n======================================================================`);
  console.log(`🚀 [Billing-Cron] Demonio de Facturación Iniciado en Docker`);
  console.log(`🌍 Zona Horaria: ${TIMEZONE}`);
  console.log(`⏰ Programación Diaria: Todos los días a las ${String(SCHEDULED_HOUR).padStart(2, '0')}:${String(SCHEDULED_MINUTE).padStart(2, '0')} hrs`);
  console.log(`🔗 Contenedor Destino: ${TARGET_URL}`);
  console.log(`======================================================================\n`);

  // 1. Verificación inicial de conectividad (espera 4 segundos para asegurar que el contenedor principal esté listo)
  setTimeout(() => executeCronBilling(true), 4000);

  // 2. Loop de evaluación cada 30 segundos
  setInterval(() => {
    const now = getNowInCancun();

    // Si coincide con la hora y minuto programados y no se ha ejecutado hoy
    if (
      now.hour === SCHEDULED_HOUR &&
      now.minute === SCHEDULED_MINUTE &&
      lastExecutedDate !== now.dateStr
    ) {
      executeCronBilling(false);
    }
  }, 30000);
}

startSchedulerLoop();
