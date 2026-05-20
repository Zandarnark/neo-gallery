import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'
import { deleteExhibition, updateExhibition } from '@/lib/db/repositories/exhibitions'
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
    const exhibition = await updateExhibition(params.id, body)
    return NextResponse.json({ exhibition })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось обновить выставку' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  initializeDatabase()

  try {
    await requireRole(['admin'])
    await deleteExhibition(params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось удалить выставку' }, { status: 500 })
  }
}
