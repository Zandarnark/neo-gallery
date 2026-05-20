import { NextResponse } from 'next/server'
import { createArtwork, listArtworks } from '@/lib/db/repositories/artworks'
import { initializeDatabase } from '@/lib/db/init'
import { requireRole } from '@/lib/http/auth'
import { ApiError } from '@/lib/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  initializeDatabase()

  try {
    await requireRole(['admin'])
    return NextResponse.json({ artworks: await listArtworks() })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось загрузить работы' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  initializeDatabase()

  try {
    await requireRole(['admin'])
    const body = await request.json()
    const artwork = await createArtwork({
      exhibition_id: String(body.exhibition_id),
      artist_id: body.artist_id ?? null,
      title: String(body.title ?? ''),
      media_type: body.media_type ?? 'image',
      file_url: String(body.file_url ?? ''),
      thumb_url: String(body.thumb_url ?? ''),
      price: body.price == null ? null : Number(body.price),
      license_type: body.license_type ?? null,
      polygon_count: body.polygon_count == null ? null : Number(body.polygon_count),
      lod_levels: body.lod_levels == null ? null : Number(body.lod_levels),
      description: body.description ?? null,
      position_x: body.position_x == null ? null : Number(body.position_x),
      position_y: body.position_y == null ? null : Number(body.position_y),
      position_z: body.position_z == null ? null : Number(body.position_z),
    })

    return NextResponse.json({ artwork })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось создать работу' }, { status: 500 })
  }
}
