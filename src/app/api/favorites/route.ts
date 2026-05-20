import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'
import { addFavorite, listFavorites } from '@/lib/db/repositories/favorites'
import { requireUser } from '@/lib/http/auth'
import { ApiError } from '@/lib/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  initializeDatabase()

  try {
    const user = await requireUser()
    return NextResponse.json({ favorites: await listFavorites(user.id) })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось загрузить избранное' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  initializeDatabase()

  try {
    const user = await requireUser()
    const body = await request.json()
    await addFavorite(user.id, String(body.artworkId))
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось добавить в избранное' }, { status: 500 })
  }
}
