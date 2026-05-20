import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'
import { removeFavorite } from '@/lib/db/repositories/favorites'
import { requireUser } from '@/lib/http/auth'
import { ApiError } from '@/lib/http/errors'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _request: Request,
  { params }: { params: { artworkId: string } }
) {
  initializeDatabase()

  try {
    const user = await requireUser()
    await removeFavorite(user.id, params.artworkId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось удалить из избранного' }, { status: 500 })
  }
}
