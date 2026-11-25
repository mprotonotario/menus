import { NextResponse } from 'next/server';
import { evaluateBillingStatus } from '../../../../lib/billingStatus';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const body = await request.json();
    const { pin, suspend } = body;

    let billingData = null;
    const billingPath = path.join(process.cwd(), 'data', 'billing.json');
    if (fs.existsSync(billingPath)) {
      try {
        billingData = JSON.parse(fs.readFileSync(billingPath, 'utf8'));
      } catch (e) {
        console.warn('Error reading billing.json:', e);
      }
    }

    const expectedPin = billingData?.ownerPin || '2026';
    if (String(pin).trim() !== String(expectedPin).trim()) {
      return NextResponse.json({ success: false, error: 'PIN de seguridad incorrecto.' }, { status: 401 });
    }

    if (billingData) {
      billingData.isSuspended = Boolean(suspend);
      fs.writeFileSync(billingPath, JSON.stringify(billingData, null, 2));
    }

    const updatedStatus = evaluateBillingStatus(billingData || { isSuspended: Boolean(suspend) });

    return NextResponse.json(
      {
        success: true,
        message: suspend
          ? '🛑 Plataforma pausada exitosamente. Los pedidos por WhatsApp han sido bloqueados.'
          : '▶️ Plataforma reactivada exitosamente. Los pedidos por WhatsApp vuelven a estar activos.',
        isSuspended: Boolean(suspend),
        billingStatus: updatedStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al modificar estado de pausa' },
      { status: 500 }
    );
  }
}
