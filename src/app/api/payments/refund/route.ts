import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { payment_id, amount, reason } = body

    if (!payment_id) {
      return NextResponse.json(
        { error: 'payment_id is required' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      mock: true,
      refund_id: `refund-mock-${Date.now()}`,
      payment_id,
      status: 'succeeded',
      amount: amount || 0,
      currency: 'RUB',
      reason: reason || 'Возврат по запросу пользователя',
    })
  } catch (error) {
    console.error('[Refund Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
