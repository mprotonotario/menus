import { NextResponse } from 'next/server';
import { renewBillingCycle, evaluateBillingStatus } from '../../../../lib/billingStatus';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const body = await request.json();
    const { pin, monthsToAdd = 1 } = body;

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

    const result = renewBillingCycle({ pin, monthsToAdd });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 401 });
    }

    if (billingData) {
      billingData.nextBillingDate = result.newNextBillingDate;
      billingData.isSuspended = false;
      fs.writeFileSync(billingPath, JSON.stringify(billingData, null, 2));
    }

    const updatedStatus = evaluateBillingStatus(billingData);

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        newNextBillingDate: result.newNextBillingDate,
        billingStatus: updatedStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error al procesar renovación' },
      { status: 500 }
    );
  }
}
