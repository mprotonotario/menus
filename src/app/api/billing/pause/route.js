import { NextResponse } from 'next/server';
import { setPlatformSuspension, evaluateBillingStatus } from '../../../../lib/billingStatus';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const body = await request.json();
    const { pin, suspend } = body;

    const result = setPlatformSuspension({ pin, suspend: Boolean(suspend) });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 401 });
    }

    // Persistir directamente en data/billing.json
    try {
      const billingPath = path.join(process.cwd(), 'data', 'billing.json');
      if (fs.existsSync(billingPath)) {
        const current = JSON.parse(fs.readFileSync(billingPath, 'utf8'));
        current.isSuspended = Boolean(suspend);
        fs.writeFileSync(billingPath, JSON.stringify(current, null, 2));
      }
    } catch (fsErr) {
      console.warn('Error al actualizar billing.json:', fsErr);
    }

    const updatedStatus = evaluateBillingStatus({ isSuspended: Boolean(suspend) });

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        isSuspended: result.isSuspended,
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
