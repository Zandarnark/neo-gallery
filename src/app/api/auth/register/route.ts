import { NextResponse } from 'next/server'
import { setSessionCookie } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/init'
import { createUser, findUserByEmail } from '@/lib/db/repositories/users'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  initializeDatabase()

  try {
    const body = await request.json()
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')

    if (!email || !password) {
      return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Пароль должен быть не короче 6 символов' }, { status: 400 })
    }

    if (await findUserByEmail(email)) {
      return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 409 })
    }

    const user = await createUser(email, password)
    const response = NextResponse.json({ user })
    await setSessionCookie(response, user)
    return response
  } catch {
    return NextResponse.json({ error: 'Не удалось зарегистрироваться' }, { status: 500 })
  }
}
