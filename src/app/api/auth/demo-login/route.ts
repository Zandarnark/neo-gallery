import { NextResponse } from 'next/server'
import { setSessionCookie } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/init'
import { findUserByEmail, findUserByRole, toPublicUser } from '@/lib/db/repositories/users'
import type { UserRole } from '@/lib/db/types'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  initializeDatabase()

  try {
    const body = await request.json()
    const role = String(body.role ?? '') as UserRole

    if (!['visitor', 'artist', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Неизвестная демо-роль' }, { status: 400 })
    }

    const user =
      role === 'admin'
        ? await findUserByEmail(process.env.ADMIN_EMAIL ?? '')
        : await findUserByRole(role)

    const publicUser = toPublicUser(user)

    if (!publicUser) {
      return NextResponse.json({ error: 'Демо-аккаунт не найден' }, { status: 404 })
    }

    const response = NextResponse.json({ user: publicUser })
    await setSessionCookie(response, publicUser)
    return response
  } catch {
    return NextResponse.json({ error: 'Не удалось выполнить демо-вход' }, { status: 500 })
  }
}
