import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'
import { getSupabaseAdmin } from '@/lib/db/client'
import { requireRole } from '@/lib/http/auth'
import { ApiError } from '@/lib/http/errors'

export const dynamic = 'force-dynamic'

const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])

export async function POST(request: Request) {
  initializeDatabase()

  try {
    await requireRole(['artist', 'admin'])
    const supabase = getSupabaseAdmin()
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'neogallery'
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
    }

    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: 'Поддерживаются только PNG, JPG, WEBP и GIF' }, { status: 400 })
    }

    const bytes = Buffer.from(await file.arrayBuffer())
    const extension = file.name.includes('.') ? file.name.split('.').pop() : 'bin'
    const safeName = `uploads/${Date.now()}-${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(safeName, bytes, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(safeName)

    return NextResponse.json({ url: data.publicUrl })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось загрузить файл' }, { status: 500 })
  }
}
