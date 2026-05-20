import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'
import { createArtwork, listArtworksByArtist } from '@/lib/db/repositories/artworks'
import { requireRole } from '@/lib/http/auth'
import { ApiError } from '@/lib/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  initializeDatabase()

  try {
    const user = await requireRole(['artist', 'admin'])
    return NextResponse.json({ artworks: await listArtworksByArtist(user.id) })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось загрузить работы автора' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  initializeDatabase()

  try {
    const user = await requireRole(['artist', 'admin'])
    const body = await request.json()
    const artwork = await createArtwork({
      exhibition_id: String(body.exhibition_id ?? ''),
      artist_id: user.id,
      title: String(body.title ?? ''),
      media_type: body.media_type ?? 'image',
      file_url: String(body.file_url ?? ''),
      thumb_url: String(body.thumb_url ?? body.file_url ?? ''),
      price: body.price == null || body.price === '' ? null : Number(body.price),
      license_type: body.license_type || null,
      polygon_count: body.polygon_count == null || body.polygon_count === '' ? null : Number(body.polygon_count),
      lod_levels: body.lod_levels == null || body.lod_levels === '' ? null : Number(body.lod_levels),
      description: body.description || null,
      position_x: body.position_x == null || body.position_x === '' ? 0 : Number(body.position_x),
      position_y: body.position_y == null || body.position_y === '' ? 1.5 : Number(body.position_y),
      position_z: body.position_z == null || body.position_z === '' ? -5 : Number(body.position_z),
    })

    return NextResponse.json({ artwork })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось создать работу' }, { status: 500 })
  }
}
