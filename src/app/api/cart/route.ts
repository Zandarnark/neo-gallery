import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'
import { addCartItem, listCartItems, replaceCart } from '@/lib/db/repositories/cart'
import { requireUser } from '@/lib/http/auth'
import { ApiError } from '@/lib/http/errors'

export const dynamic = 'force-dynamic'

function mapCartItem(item: {
  id: string
  type: 'ticket' | 'merch' | 'license' | 'subscription'
  ref_id: string
  title: string
  price: number
  qty: number
  exhibition_id: string | null
  license_type: 'personal' | 'commercial' | null
}) {
  return {
    id: item.id,
    type: item.type,
    refId: item.ref_id,
    title: item.title,
    price: item.price,
    qty: item.qty,
    exhibitionId: item.exhibition_id ?? undefined,
    licenseType: item.license_type ?? undefined,
  }
}

export async function GET() {
  initializeDatabase()

  try {
    const user = await requireUser()
    const items = (await listCartItems(user.id)).map(mapCartItem)
    return NextResponse.json({ items })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось загрузить корзину' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  initializeDatabase()

  try {
    const user = await requireUser()
    const body = await request.json()

    if (Array.isArray(body.items)) {
      await replaceCart(user.id, body.items)
      return NextResponse.json({ ok: true })
    }

    await addCartItem(user.id, body)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось обновить корзину' }, { status: 500 })
  }
}
