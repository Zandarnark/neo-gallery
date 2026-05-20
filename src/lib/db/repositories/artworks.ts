import { createId, getSupabaseAdmin } from '@/lib/db/client'
import type { ArtworkRecord } from '@/lib/db/types'
import type { Database } from '@/lib/supabase/types'

export async function getArtworkById(id: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('artworks').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return (data as ArtworkRecord | null) ?? undefined
}

export async function listArtworks() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('artworks').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ArtworkRecord[]
}

export async function listArtworksByArtist(artistId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as ArtworkRecord[]
}

export async function createArtwork(input: Omit<ArtworkRecord, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseAdmin()
  const payload: Database['public']['Tables']['artworks']['Insert'] = {
    id: createId('art'),
    exhibition_id: input.exhibition_id,
    artist_id: input.artist_id,
    title: input.title,
    media_type: input.media_type,
    file_url: input.file_url,
    thumb_url: input.thumb_url,
    price: input.price,
    license_type: input.license_type,
    polygon_count: input.polygon_count,
    lod_levels: input.lod_levels,
    description: input.description,
    position_x: input.position_x,
    position_y: input.position_y,
    position_z: input.position_z,
  }

  const { data, error } = await supabase
    .from('artworks' as never)
    .insert(payload as never)
    .select('*')
    .single()
  if (error) throw error
  return data as ArtworkRecord
}

export async function updateArtwork(id: string, updates: Partial<Omit<ArtworkRecord, 'id' | 'created_at'>>) {
  const supabase = getSupabaseAdmin()
  const payload = updates as Database['public']['Tables']['artworks']['Update']
  const { data, error } = await supabase
    .from('artworks' as never)
    .update(payload as never)
    .eq('id', id)
    .select('*')
    .maybeSingle()
  if (error) throw error
  return (data as ArtworkRecord | null) ?? null
}

export async function deleteArtwork(id: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('artworks').delete().eq('id', id)
  if (error) throw error
}
