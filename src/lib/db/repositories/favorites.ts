import { createId, getSupabaseAdmin } from '@/lib/db/client'
import type { Database } from '@/lib/supabase/types'

export async function listFavorites(userId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('favorites')
    .select('id, artwork_id, created_at, artworks(title, thumb_url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const rows = (data ?? []) as Array<{
    id: string
    artwork_id: string
    created_at: string
    artworks: { title: string; thumb_url: string | null } | null
  }>

  return rows.map((item) => ({
    id: item.id,
    artwork_id: item.artwork_id,
    created_at: item.created_at,
    title: item.artworks?.title ?? '',
    thumb_url: item.artworks?.thumb_url ?? '',
  }))
}

export async function addFavorite(userId: string, artworkId: string) {
  const supabase = getSupabaseAdmin()
  const payload: Database['public']['Tables']['favorites']['Insert'] = {
    id: createId('fav'),
    user_id: userId,
    artwork_id: artworkId,
  }

  const { error } = await supabase.from('favorites' as never).upsert(payload as never, { onConflict: 'user_id,artwork_id' })
  if (error) throw error
}

export async function removeFavorite(userId: string, artworkId: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('artwork_id', artworkId)
  if (error) throw error
}
