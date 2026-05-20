import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const paymentId = params.id

    return NextResponse.json({
      mock: true,
      payment_id: paymentId,
      status: 'succeeded',
      amount: 0,
      currency: 'RUB',
    })
}
