import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'
import { removeCartItem, updateCartItem } from '@/lib/db/repositories/cart'
import { requireUser } from '@/lib/http/auth'
import { ApiError } from '@/lib/http/errors'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  initializeDatabase()

  try {
    const user = await requireUser()
    const body = await request.json()
    await updateCartItem(user.id, params.id, Number(body.qty ?? 0))
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось обновить корзину' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  initializeDatabase()

  try {
    const user = await requireUser()
    await removeCartItem(user.id, params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось удалить товар из корзины' }, { status: 500 })
  }
}
