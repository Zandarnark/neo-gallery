import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'
import { deleteArtwork, getArtworkById, updateArtwork } from '@/lib/db/repositories/artworks'
import { requireRole } from '@/lib/http/auth'
import { ApiError } from '@/lib/http/errors'

export const dynamic = 'force-dynamic'

async function requireOwner(id: string) {
  const user = await requireRole(['artist', 'admin'])
  const artwork = await getArtworkById(id)

  if (!artwork) {
    throw new ApiError(404, 'Работа не найдена')
  }

  if (user.role !== 'admin' && artwork.artist_id !== user.id) {
    throw new ApiError(403, 'Можно изменять только свои работы')
  }

  return user
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  initializeDatabase()

  try {
    const user = await requireOwner(params.id)
    const body = await request.json()
    const artwork = await updateArtwork(params.id, {
      exhibition_id: body.exhibition_id,
      artist_id: user.role === 'admin' && body.artist_id !== undefined ? body.artist_id : user.id,
      title: body.title,
      media_type: body.media_type,
      file_url: body.file_url,
      thumb_url: body.thumb_url,
      price: body.price == null || body.price === '' ? null : Number(body.price),
      license_type: body.license_type || null,
      polygon_count: body.polygon_count == null || body.polygon_count === '' ? null : Number(body.polygon_count),
      lod_levels: body.lod_levels == null || body.lod_levels === '' ? null : Number(body.lod_levels),
      description: body.description || null,
      position_x: body.position_x == null || body.position_x === '' ? null : Number(body.position_x),
      position_y: body.position_y == null || body.position_y === '' ? null : Number(body.position_y),
      position_z: body.position_z == null || body.position_z === '' ? null : Number(body.position_z),
    })

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
    await requireOwner(params.id)
    await deleteArtwork(params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось удалить работу' }, { status: 500 })
  }
}
