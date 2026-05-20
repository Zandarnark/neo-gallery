import { NextResponse } from 'next/server'
import { setSessionCookie } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/init'
import { verifyUserCredentials } from '@/lib/db/repositories/users'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  initializeDatabase()

  try {
    const body = await request.json()
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const user = await verifyUserCredentials(email, password)

    if (!user) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
    }

    const response = NextResponse.json({ user })
    await setSessionCookie(response, user)
    return response
  } catch (e: any) {
    console.error('login error:', e?.message, e?.stack)
    return NextResponse.json({ error: 'Не удалось выполнить вход', details: e?.message }, { status: 500 })
  }
}
