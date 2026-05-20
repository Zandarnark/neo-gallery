import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({ received: true, mock: true, event: body?.event ?? body?.type ?? 'unknown' })
  } catch (error) {
    console.error('[Webhook Error]', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
