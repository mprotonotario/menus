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

    // Persistir en disco en data/billing-control.json
    try {
      const controlDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(controlDir)) fs.mkdirSync(controlDir, { recursive: true });
      fs.writeFileSync(
        path.join(controlDir, 'billing-control.json'),
        JSON.stringify(
          {
            isSuspended: Boolean(suspend),
            lastUpdated: new Date().toISOString(),
          },
          null,
          2
        )
      );
    } catch (fsErr) {
      console.warn('Error al persistir billing-control.json:', fsErr);
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
