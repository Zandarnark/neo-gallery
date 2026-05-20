import { createId, getSupabaseAdmin } from '@/lib/db/client'
import type { ArtworkRecord, ArtworkWithArtist, ExhibitionRecord, TicketRecord } from '@/lib/db/types'
import type { Database } from '@/lib/supabase/types'

function mapArtwork(row: ArtworkRecord & { users?: { email: string; role: string; avatar_url: string | null } | null }): ArtworkWithArtist {
  return {
    ...row,
    artist: row.artist_id && row.users
      ? {
          id: row.artist_id,
          email: row.users.email,
          role: row.users.role as 'visitor' | 'artist' | 'admin',
          avatarUrl: row.users.avatar_url,
        }
      : null,
  }
}

export async function listPublishedExhibitions() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('exhibitions')
    .select('*, artworks(count)')
    .neq('status', 'archived')
    .order('start_date', { ascending: false })

  if (error) throw error

  const rows = (data ?? []) as Array<ExhibitionRecord & { artworks?: Array<{ count: number }> }>

  return rows.map((row) => ({
    ...row,
    artwork_count: row.artworks?.[0]?.count ?? 0,
  }))
}

export async function listExhibitions() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('exhibitions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as ExhibitionRecord[]
}

export async function getExhibitionBySlug(slug: string) {
  const supabase = getSupabaseAdmin()
  const { data: exhibitionData, error: exhibitionError } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (exhibitionError) throw exhibitionError
  const exhibition = (exhibitionData as ExhibitionRecord | null) ?? null
  if (!exhibition) return null

  const { data: artworks, error: artworksError } = await supabase
    .from('artworks')
    .select('*, users(email, role, avatar_url)')
    .eq('exhibition_id', exhibition.id)
    .order('created_at', { ascending: true })

  if (artworksError) throw artworksError

  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('*')
    .eq('exhibition_id', exhibition.id)
    .order('price', { ascending: true })

  if (ticketsError) throw ticketsError
  const ticketRows = (tickets ?? []) as TicketRecord[]

  return {
    exhibition: { ...exhibition },
    artworks: ((artworks ?? []) as Array<ArtworkRecord & { users?: { email: string; role: string; avatar_url: string | null } | null }>).map(mapArtwork),
    tickets: ticketRows.map((ticket) => ({
      ...ticket,
      perks_json: ticket.perks_json ?? {},
    })) as TicketRecord[],
  }
}

export async function createExhibition(input: Omit<ExhibitionRecord, 'created_at' | 'updated_at'>) {
  const supabase = getSupabaseAdmin()
  const payload: Database['public']['Tables']['exhibitions']['Insert'] = {
    id: input.id || createId('exh'),
    title: input.title,
    slug: input.slug,
    status: input.status,
    start_date: input.start_date,
    end_date: input.end_date,
    cover_url: input.cover_url,
    description: input.description,
  }

  const { error } = await supabase.from('exhibitions' as never).insert(payload as never)
  if (error) throw error
}

export async function updateExhibition(id: string, updates: Partial<Omit<ExhibitionRecord, 'id' | 'created_at'>>) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('exhibitions' as never).update(updates as never).eq('id', id)
  if (error) throw error

  const { data, error: refetchError } = await supabase.from('exhibitions').select('*').eq('id', id).maybeSingle()
  if (refetchError) throw refetchError
  return data
}

export async function deleteExhibition(id: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('exhibitions').delete().eq('id', id)
  if (error) throw error
}
