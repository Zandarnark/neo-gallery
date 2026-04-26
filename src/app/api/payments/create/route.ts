import { NextRequest, NextResponse } from 'next/server'

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_PAYMENT === 'true'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cart_items, user_id, return_url } = body

    if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
      return NextResponse.json(
        { error: 'cart_items is required and must be non-empty' },
        { status: 400 }
      )
    }

    const total = cart_items.reduce(
      (sum: number, item: { price: number; qty: number }) =>
        sum + item.price * item.qty,
      0
    )

    if (MOCK_MODE) {
      const paymentId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

      console.log(`[MOCK PAYMENT] Created payment: ${paymentId}, amount: ${total} RUB`)

      return NextResponse.json({
        mock: true,
        payment_id: paymentId,
        confirmation_url: `${return_url || 'http://localhost:3000/checkout'}?payment_id=${paymentId}&mock=true`,
        status: 'pending',
        amount: total,
        currency: 'RUB',
        idempotency_key: crypto.randomUUID(),
        description: 'Тестовая оплата NeoGallery (заглушка ЮKassa)',
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

    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        amount: {
          value: total.toFixed(2),
          currency: 'RUB',
        },
        confirmation: {
          type: 'redirect',
          return_url: return_url || 'http://localhost:3000/checkout',
        },
        capture: true,
        description: `Заказ NeoGallery (${cart_items.length} позиций)`,
        metadata: {
          user_id,
          item_count: cart_items.length.toString(),
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[YooKassa API Error]', errorData)
      return NextResponse.json(
        { error: 'Payment creation failed', details: errorData },
        { status: response.status }
      )
    }

    const paymentData = await response.json()

    return NextResponse.json({
      payment_id: paymentData.id,
      confirmation_url: paymentData.confirmation?.confirmation_url,
      status: paymentData.status,
      amount: total,
      currency: 'RUB',
      idempotency_key: idempotencyKey,
    })
  } catch (error) {
    console.error('[Payment Create Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
