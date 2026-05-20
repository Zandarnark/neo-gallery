import { NextResponse } from 'next/server'
import { deleteArtwork, updateArtwork } from '@/lib/db/repositories/artworks'
import { initializeDatabase } from '@/lib/db/init'
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
    const artwork = await updateArtwork(params.id, body)
    return NextResponse.json({ artwork })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось обновить работу' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  initializeDatabase()

  try {
    await requireRole(['admin'])
    await deleteArtwork(params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось удалить работу' }, { status: 500 })
  }
}
