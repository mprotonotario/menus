import { NextResponse } from 'next/server';
import { evaluateBillingStatus } from '../../../../lib/billingStatus';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let fileSuspended = null;
    const controlPath = path.join(process.cwd(), 'data', 'billing-control.json');
    if (fs.existsSync(controlPath)) {
      try {
        const raw = fs.readFileSync(controlPath, 'utf8');
        const json = JSON.parse(raw);
        if (typeof json.isSuspended === 'boolean') {
          fileSuspended = json.isSuspended;
        }
      } catch (e) {
        console.warn('Error reading billing-control.json:', e);
      }
    }

    const billingStatus = evaluateBillingStatus(
      fileSuspended !== null ? { isSuspended: fileSuspended } : null
    );

    return NextResponse.json({ success: true, billingStatus }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener estado' },
      { status: 500 }
    );
  }
}
