import { NextResponse } from 'next/server';
import { renewBillingCycle, evaluateBillingStatus } from '../../../../lib/billingStatus';

export async function POST(request) {
  try {
    const body = await request.json();
    const { pin, monthsToAdd = 1 } = body;

    const result = renewBillingCycle({ pin, monthsToAdd });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 401 });
    }

    const updatedStatus = evaluateBillingStatus();

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
