import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/init'

export const dynamic = 'force-dynamic'

export async function GET() {
  initializeDatabase()
  const user = await getSessionUser()
  return NextResponse.json({ user })
}
