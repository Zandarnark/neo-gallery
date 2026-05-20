import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'
import { getExhibitionBySlug } from '@/lib/db/repositories/exhibitions'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  initializeDatabase()
  const data = await getExhibitionBySlug(params.slug)

  if (!data) {
    return NextResponse.json({ error: 'Выставка не найдена' }, { status: 404 })
  }

  return NextResponse.json(data)
}
