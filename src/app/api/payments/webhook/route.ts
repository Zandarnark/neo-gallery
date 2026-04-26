import { NextRequest, NextResponse } from 'next/server'

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_PAYMENT === 'true'

export async function POST(request: NextRequest) {
  try {
    if (MOCK_MODE) {
      const body = await request.json()
      console.log('[MOCK WEBHOOK] Received:', JSON.stringify(body, null, 2))

      const eventType = body?.event || body?.type || 'unknown'
      const paymentStatus = body?.object?.status || 'succeeded'

      console.log(`[MOCK WEBHOOK] Event: ${eventType}, Status: ${paymentStatus}`)

      return NextResponse.json({ received: true, mock: true })
    }

    const body = await request.json()
    const eventType = body?.event
    const paymentObject = body?.object

    console.log(`[WEBHOOK] Event: ${eventType}, Payment: ${paymentObject?.id}, Status: ${paymentObject?.status}`)

    const shopId = process.env.NEXT_PUBLIC_YOOKASSA_SHOP_ID
    const secretKey = process.env.YOOKASSA_SECRET_KEY

    if (shopId && secretKey) {
      const authHeader = request.headers.get('authorization')
      if (authHeader) {
        const expectedAuth = `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`
        if (authHeader !== expectedAuth) {
          console.warn('[WEBHOOK] Auth verification failed')
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
      }
    }

    switch (eventType) {
      case 'payment.succeeded':
        console.log(`[WEBHOOK] Payment succeeded: ${paymentObject?.id}`)
        break
      case 'payment.canceled':
        console.log(`[WEBHOOK] Payment canceled: ${paymentObject?.id}`)
        break
      case 'payment.waiting_for_capture':
        console.log(`[WEBHOOK] Payment waiting for capture: ${paymentObject?.id}`)
        break
      case 'refund.succeeded':
        console.log(`[WEBHOOK] Refund succeeded: ${paymentObject?.id}`)
        break
      default:
        console.log(`[WEBHOOK] Unhandled event: ${eventType}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook Error]', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
