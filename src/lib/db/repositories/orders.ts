import { createId, getSupabaseAdmin, nowIso } from '@/lib/db/client'
import type { CartItemRecord, OrderItemRecord, OrderRecord, OrderWithItems } from '@/lib/db/types'
import type { Database } from '@/lib/supabase/types'

export async function listOrdersByUser(userId: string) {
  const supabase = getSupabaseAdmin()
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (ordersError) throw ordersError
  const orders = (ordersData ?? []) as OrderRecord[]

  const result: OrderWithItems[] = []

  for (const order of orders) {
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)

    if (itemsError) throw itemsError

    result.push({
      ...(order as OrderRecord),
      order_items: (items ?? []) as OrderItemRecord[],
    })
  }

  return result
}

export async function createOrderFromCart(userId: string, cartItems: CartItemRecord[]) {
  const supabase = getSupabaseAdmin()
  const createdAt = nowIso()
  const orderId = createId('ord')
  const paymentId = `mock_${crypto.randomUUID()}`
  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)

  const orderPayload: Database['public']['Tables']['orders']['Insert'] = {
    id: orderId,
    user_id: userId,
    status: 'paid',
    total,
    currency: 'RUB',
    payment_id: paymentId,
    created_at: createdAt,
  }

  const { error: orderError } = await supabase.from('orders' as never).insert(orderPayload as never)
  if (orderError) throw orderError

  const itemsPayload: Database['public']['Tables']['order_items']['Insert'][] = cartItems.map((item) => ({
    id: createId('oi'),
    order_id: orderId,
    type: item.type,
    ref_id: item.ref_id,
    qty: item.qty,
    price: item.price,
  }))

  const { error: itemsError } = await supabase.from('order_items' as never).insert(itemsPayload as never)
  if (itemsError) throw itemsError

  const { error: deleteError } = await supabase.from('cart_items').delete().eq('user_id', userId)
  if (deleteError) throw deleteError

  return {
    id: orderId,
    user_id: userId,
    status: 'paid',
    total,
    currency: 'RUB',
    payment_id: paymentId,
    created_at: createdAt,
    order_items: itemsPayload,
  } satisfies OrderWithItems
}
