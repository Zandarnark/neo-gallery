import { NextRequest, NextResponse } from 'next/server'

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_PAYMENT === 'true'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const paymentId = params.id

  if (MOCK_MODE) {
    return NextResponse.json({
      mock: true,
      payment_id: paymentId,
      status: 'succeeded',
      amount: 0,
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

  try {
    const response = await fetch(
      `https://api.yookassa.ru/v3/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch payment status' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      payment_id: data.id,
      status: data.status,
      amount: data.amount?.value,
      currency: data.amount?.currency,
    })
  } catch (error) {
    console.error('[Payment Status Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
