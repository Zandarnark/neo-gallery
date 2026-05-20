import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'
import { listExhibitions, listPublishedExhibitions } from '@/lib/db/repositories/exhibitions'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  initializeDatabase()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  if (status === 'all') {
    return NextResponse.json({ exhibitions: await listExhibitions() })
  }

  return NextResponse.json({ exhibitions: await listPublishedExhibitions() })
}
