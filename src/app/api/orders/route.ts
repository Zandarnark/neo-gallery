import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/db/init'
import { listCartItems } from '@/lib/db/repositories/cart'
import { createOrderFromCart, listOrdersByUser } from '@/lib/db/repositories/orders'
import { requireUser } from '@/lib/http/auth'
import { ApiError } from '@/lib/http/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  initializeDatabase()

  try {
    const user = await requireUser()
    return NextResponse.json({ orders: await listOrdersByUser(user.id) })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось загрузить заказы' }, { status: 500 })
  }
}

export async function POST() {
  initializeDatabase()

  try {
    const user = await requireUser()
    const cartItems = await listCartItems(user.id)

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Корзина пуста' }, { status: 400 })
    }

    const order = await createOrderFromCart(user.id, cartItems)
    return NextResponse.json({ order, success: true })
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Не удалось создать заказ' }, { status: 500 })
  }
}
