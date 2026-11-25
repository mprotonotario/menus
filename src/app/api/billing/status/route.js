import { NextResponse } from 'next/server';
import { evaluateBillingStatus } from '../../../../lib/billingStatus';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let fileBilling = null;
    const billingPath = path.join(process.cwd(), 'data', 'billing.json');
    if (fs.existsSync(billingPath)) {
      try {
        const raw = fs.readFileSync(billingPath, 'utf8');
        const json = JSON.parse(raw);
        if (json && typeof json === 'object') {
          fileBilling = json;
        }
      } catch (e) {
        console.warn('Error reading billing.json:', e);
      }
    }

    const billingStatus = evaluateBillingStatus(fileBilling);

    return NextResponse.json({ success: true, billingStatus }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al obtener estado' },
      { status: 500 }
    );
  }
}
