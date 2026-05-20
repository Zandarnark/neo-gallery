import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'
import { deleteUser, updateUserRole } from '@/lib/db/repositories/users'
import type { UserRole } from '@/lib/db/types'
import { requireRole } from '@/lib/http/auth'
import { ApiError } from '@/lib/http/errors'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  initializeDatabase()

  try {
    await requireRole(['admin'])
    const body = await request.json()
    const role = String(body.role) as UserRole
    const updated = await updateUserRole(params.id, role)

    return NextResponse.json({ user: updated })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось обновить пользователя' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  initializeDatabase()

  try {
    await requireRole(['admin'])
    await deleteUser(params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось удалить пользователя' }, { status: 500 })
  }
}
