import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'
import { logAnalyticsEvent } from '@/lib/db/repositories/analytics'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  initializeDatabase()

  try {
    const body = await request.json()
    const { session_id, exhibition_id, event_type, payload, user_id } = body

    await logAnalyticsEvent({
      sessionId: String(session_id ?? 'anonymous'),
      exhibitionId: exhibition_id ?? null,
      eventType: String(event_type ?? 'unknown'),
      payload,
      userId: user_id ?? null,
    })

    return NextResponse.json({ logged: true })
  } catch {
    return NextResponse.json({ logged: false }, { status: 500 })
  }
}
