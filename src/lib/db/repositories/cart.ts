import { createId, getSupabaseAdmin, nowIso } from '@/lib/db/client'
import type { CartItemRecord } from '@/lib/db/types'
import type { Database } from '@/lib/supabase/types'

export interface CartItemInput {
  type: 'ticket' | 'merch' | 'license' | 'subscription'
  refId: string
  title: string
  price: number
  qty: number
  exhibitionId?: string
  licenseType?: 'personal' | 'commercial'
}

export async function listCartItems(userId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as CartItemRecord[]
}

export async function addCartItem(userId: string, input: CartItemInput) {
  const supabase = getSupabaseAdmin()
  const licenseType = input.licenseType ?? ''

  const { data: existingData, error: existingError } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', userId)
    .eq('type', input.type)
    .eq('ref_id', input.refId)
    .eq('license_type', licenseType)
    .maybeSingle()

  if (existingError) throw existingError
  const existing = (existingData as CartItemRecord | null) ?? null

  if (existing) {
    const { error } = await supabase
      .from('cart_items' as never)
      .update({
        qty: existing.qty + input.qty,
        updated_at: nowIso(),
        title: input.title,
        price: input.price,
        exhibition_id: input.exhibitionId ?? null,
      } as never)
      .eq('id', existing.id)
    if (error) throw error
    return
  }

  const payload: Database['public']['Tables']['cart_items']['Insert'] = {
    id: createId('cart'),
    user_id: userId,
    type: input.type,
    ref_id: input.refId,
    title: input.title,
    price: input.price,
    qty: input.qty,
    exhibition_id: input.exhibitionId ?? null,
    license_type: licenseType,
  }

  const { error } = await supabase.from('cart_items' as never).insert(payload as never)
  if (error) throw error
}

export async function updateCartItem(userId: string, id: string, qty: number) {
  const supabase = getSupabaseAdmin()
  if (qty <= 0) {
    const { error } = await supabase.from('cart_items' as never).delete().eq('user_id', userId).eq('id', id)
    if (error) throw error
    return
  }

  const { error } = await supabase
    .from('cart_items' as never)
    .update({ qty, updated_at: nowIso() } as never)
    .eq('user_id', userId)
    .eq('id', id)
  if (error) throw error
}

export async function removeCartItem(userId: string, id: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('cart_items' as never).delete().eq('user_id', userId).eq('id', id)
  if (error) throw error
}

export async function replaceCart(userId: string, items: CartItemInput[]) {
  const supabase = getSupabaseAdmin()
  const { error: deleteError } = await supabase.from('cart_items' as never).delete().eq('user_id', userId)
  if (deleteError) throw deleteError

  for (const item of items) {
    await addCartItem(userId, item)
  }
}
