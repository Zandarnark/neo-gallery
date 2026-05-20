import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'
import { listUsers } from '@/lib/db/repositories/users'
import { requireRole } from '@/lib/http/auth'
import { ApiError } from '@/lib/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  initializeDatabase()

  try {
    await requireRole(['admin'])
    return NextResponse.json({ users: await listUsers() })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось загрузить пользователей' }, { status: 500 })
  }
}
