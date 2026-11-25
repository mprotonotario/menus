import { NextResponse } from 'next/server';
import { setPlatformSuspension, evaluateBillingStatus } from '../../../../lib/billingStatus';

export async function POST(request) {
  try {
    const body = await request.json();
    const { pin, suspend } = body;

    const result = setPlatformSuspension({ pin, suspend: Boolean(suspend) });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 401 });
    }

    const updatedStatus = evaluateBillingStatus();

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
