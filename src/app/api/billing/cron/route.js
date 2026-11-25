import { NextResponse } from 'next/server';
import {
  evaluateBillingStatus,
  generateWhatsappReminderMessage,
  getCancunDateParts,
} from '../../../../lib/billingStatus';

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
    const billingStatus = evaluateBillingStatus();

    const isTargetReminderDay =
      billingStatus.diffDays === billingStatus.reminderDaysBefore ||
      (billingStatus.diffDays <= billingStatus.reminderDaysBefore && billingStatus.diffDays >= 0);

    const cycleKey = `${billingStatus.nextBillingDate}_${cancunNow.dateStr}`;
    const alreadySentToday = lastNotifiedCycle === cycleKey;

    let reminderDispatched = false;
    let dispatchMethod = 'ready_for_webhook_or_url';
    let formattedMessage = '';
    let directWhatsappUrl = '';

    if (isTargetReminderDay) {
      formattedMessage = generateWhatsappReminderMessage(billingStatus);
      const recipientPhone = billingStatus.billingPhone || '529831226847';
      directWhatsappUrl = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(formattedMessage)}`;

      // Si existe un webhook o gateway de WhatsApp configurado por variables de entorno
      if (process.env.WHATSAPP_GATEWAY_URL && !alreadySentToday) {
        try {
          await fetch(process.env.WHATSAPP_GATEWAY_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(process.env.WHATSAPP_GATEWAY_TOKEN
                ? { Authorization: `Bearer ${process.env.WHATSAPP_GATEWAY_TOKEN}` }
                : {}),
            },
            body: JSON.stringify({
              to: recipientPhone,
              message: formattedMessage,
            }),
          });
          dispatchMethod = 'webhook_dispatched';
        } catch (gatewayErr) {
          console.error('Error invoking WhatsApp gateway:', gatewayErr);
          dispatchMethod = 'gateway_error_fallback_url';
        }
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
        reminder: {
          shouldSendToday: isTargetReminderDay,
          alreadySentInThisCycle: alreadySentToday,
          reminderDispatched,
          dispatchMethod,
          recipient: billingStatus.billingPhone,
          directWhatsappUrl,
          messagePreview: formattedMessage ? formattedMessage.slice(0, 160) + '...' : null,
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
