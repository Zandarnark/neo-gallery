import { NextRequest, NextResponse } from 'next/server'

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_PAYMENT === 'true'

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

    if (MOCK_MODE) {
      const refundId = `refund-mock-${Date.now()}`
      console.log(`[MOCK REFUND] Payment: ${payment_id}, Refund: ${refundId}, Amount: ${amount}`)

      return NextResponse.json({
        mock: true,
        refund_id: refundId,
        payment_id,
        status: 'succeeded',
        amount: amount || 0,
        currency: 'RUB',
      })
    }

    const shopId = process.env.NEXT_PUBLIC_YOOKASSA_SHOP_ID
    const secretKey = process.env.YOOKASSA_SECRET_KEY

    if (!shopId || !secretKey) {
      return NextResponse.json(
        { error: 'YooKassa credentials not configured' },
        { status: 500 }
      )
    }

    const idempotencyKey = crypto.randomUUID()

    const response = await fetch('https://api.yookassa.ru/v3/refunds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        payment_id,
        amount: amount
          ? { value: amount.toFixed(2), currency: 'RUB' }
          : undefined,
        description: reason || 'Возврат по запросу пользователя',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: 'Refund creation failed', details: errorData },
        { status: response.status }
      )
    }

    const refundData = await response.json()

    return NextResponse.json({
      refund_id: refundData.id,
      payment_id: refundData.payment_id,
      status: refundData.status,
      amount: refundData.amount?.value,
      currency: refundData.amount?.currency,
    })
  } catch (error) {
    console.error('[Refund Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
