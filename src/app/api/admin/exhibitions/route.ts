import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'
import { createId } from '@/lib/db/client'
import { createExhibition, listExhibitions } from '@/lib/db/repositories/exhibitions'
import { requireRole } from '@/lib/http/auth'
import { ApiError } from '@/lib/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  initializeDatabase()

  try {
    await requireRole(['admin'])
    return NextResponse.json({ exhibitions: await listExhibitions() })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось загрузить выставки' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  initializeDatabase()

  try {
    await requireRole(['admin'])
    const body = await request.json()
    await createExhibition({
      id: createId('exh'),
      title: String(body.title ?? ''),
      slug: String(body.slug ?? ''),
      status: body.status ?? 'draft',
      start_date: String(body.start_date ?? new Date().toISOString().slice(0, 10)),
      end_date: body.end_date ?? null,
      cover_url: body.cover_url ?? null,
      description: body.description ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось создать выставку' }, { status: 500 })
  }
}
