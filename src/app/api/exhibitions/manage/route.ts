import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'
import { listExhibitions } from '@/lib/db/repositories/exhibitions'
import { requireRole } from '@/lib/http/auth'
import { ApiError } from '@/lib/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  initializeDatabase()

  try {
    await requireRole(['artist', 'admin'])
    return NextResponse.json({ exhibitions: await listExhibitions() })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось загрузить выставки' }, { status: 500 })
  }
}
