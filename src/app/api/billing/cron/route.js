import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  evaluateBillingStatus,
  generateWhatsappReminderMessage,
  generateTelegramAdminNotification,
  sendTelegramAdminNotification,
  getCancunDateParts,
} from '../../../../lib/billingStatus';

function getLiveBillingData() {
  try {
    const billingPath = path.join(process.cwd(), 'data', 'billing.json');
    if (fs.existsSync(billingPath)) {
      const raw = fs.readFileSync(billingPath, 'utf8');
      const json = JSON.parse(raw);
      if (json && typeof json === 'object') return json;
    }
  } catch (e) {
    console.warn('Error reading billing.json in cron:', e);
  }
  return null;
}

// Almacén en memoria del último ciclo notificado para evitar envíos duplicados en un mismo día/ciclo
let lastNotifiedCycle = null;

export async function GET(request) {
  return handleCron(request);
}

export async function POST(request) {
  return handleCron(request);
}

async function handleCron(request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    const secretProvided = searchParams.get('secret') || (authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null);
    const forceSimulate = searchParams.get('force') === 'true' || searchParams.get('simulate') === 'true';
    const shouldRedirect = searchParams.get('redirect') === 'true';

    const expectedSecret = process.env.CRON_SECRET || 'cron_secret_maria_bonita_2026';

    // Protección mediante secreto de Cron
    if (secretProvided !== expectedSecret) {
      return NextResponse.json(
        {
          error: 'Unauthorized. Proporciona un CRON_SECRET válido en header Authorization o parámetro ?secret=',
        },
        { status: 401 }
      );
    }

    const cancunNow = getCancunDateParts();
    const liveBilling = getLiveBillingData();
    const billingStatus = evaluateBillingStatus(liveBilling);

    const isTargetReminderDay =
      forceSimulate ||
      billingStatus.diffDays === billingStatus.reminderDaysBefore ||
      (billingStatus.diffDays <= billingStatus.reminderDaysBefore && billingStatus.diffDays >= 0);

    const cycleKey = `${billingStatus.nextBillingDate}_${cancunNow.dateStr}`;
    const alreadySentToday = !forceSimulate && lastNotifiedCycle === cycleKey;

    let reminderDispatched = false;
    let dispatchMethod = 'telegram_admin_notify';
    let formattedMessage = '';
    let directWhatsappUrl = '';
    let telegramResult = null;
    let telegramMessage = '';

    if (isTargetReminderDay) {
      formattedMessage = generateWhatsappReminderMessage(billingStatus);
      const recipientPhone = billingStatus.billingPhone || '529831226847';
      directWhatsappUrl = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(formattedMessage)}`;

      // Si se solicitó redirección directa por navegador a WhatsApp
      if (shouldRedirect && directWhatsappUrl) {
        return NextResponse.redirect(directWhatsappUrl);
      }

      // Generar notificación para el Administrador en Telegram con botón a WhatsApp
      const tgPayload = generateTelegramAdminNotification(billingStatus, directWhatsappUrl);
      telegramMessage = tgPayload.text;

      const botToken = process.env.TELEGRAM_BOT_TOKEN || billingStatus.telegramAdmin?.botToken;
      const chatId = process.env.TELEGRAM_CHAT_ID || billingStatus.telegramAdmin?.chatId;

      if (botToken && chatId && (!alreadySentToday || forceSimulate)) {
        telegramResult = await sendTelegramAdminNotification({
          botToken,
          chatId,
          text: tgPayload.text,
          inlineKeyboard: tgPayload.inlineKeyboard,
        });
        dispatchMethod = telegramResult.success ? 'telegram_delivered' : 'telegram_failed';
      } else if (!botToken || !chatId) {
        dispatchMethod = 'telegram_credentials_pending';
      }

      lastNotifiedCycle = cycleKey;
      reminderDispatched = true;
    }

    return NextResponse.json(
      {
        success: true,
        cancunDate: cancunNow.dateStr,
        timezone: 'America/Cancun',
        billing: {
          nextBillingDate: billingStatus.nextBillingDate,
          diffDays: billingStatus.diffDays,
          daysUntilDue: billingStatus.daysUntilDue,
          daysPastDue: billingStatus.daysPastDue,
          graceDays: billingStatus.graceDays,
          reminderDaysBefore: billingStatus.reminderDaysBefore,
          status: billingStatus.status,
          canSendWhatsappOrder: billingStatus.canSendWhatsappOrder,
          monthlyFee: billingStatus.monthlyFee,
          currency: billingStatus.currency,
        },
        notification: {
          channel: 'telegram_bot_admin',
          shouldSendToday: isTargetReminderDay,
          alreadySentInThisCycle: alreadySentToday,
          reminderDispatched,
          dispatchMethod,
          clientPhone: billingStatus.billingPhone,
          directWhatsappUrl,
          telegramStatus: telegramResult || (dispatchMethod === 'telegram_credentials_pending' ? {
            success: false,
            note: 'Configura TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID en docker-compose.yml o data/billing.json para recibir la notificación automática en tu Telegram',
          } : null),
          telegramMessagePreview: telegramMessage ? telegramMessage.slice(0, 150) + '...' : null,
          whatsappMessageForClient: formattedMessage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in billing cron route handler:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error interno al evaluar cron de facturación',
      },
      { status: 500 }
    );
  }
}
