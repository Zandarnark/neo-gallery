import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cart_items } = body

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

    return NextResponse.json({
      mock: true,
      payment_id: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      status: 'succeeded',
      amount: total,
      currency: 'RUB',
      idempotency_key: crypto.randomUUID(),
    })
  } catch (error) {
    console.error('[Payment Create Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
