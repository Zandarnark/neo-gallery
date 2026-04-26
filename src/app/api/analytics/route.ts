import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, exhibition_id, event_type, payload } = body

    console.log(
      `[ANALYTICS] Session: ${session_id}, Exhibition: ${exhibition_id}, Event: ${event_type}`,
      payload || ''
    )

    return NextResponse.json({ logged: true })
  } catch {
    return NextResponse.json({ logged: false }, { status: 500 })
  }
}
