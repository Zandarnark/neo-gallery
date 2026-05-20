export type UserRole = 'visitor' | 'artist' | 'admin'

export interface UserRecord {
  id: string
  email: string
  password_hash: string
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface PublicUser {
  id: string
  email: string
  role: UserRole
  avatarUrl: string | null
}

export interface ExhibitionRecord {
  id: string
  title: string
  slug: string
  status: 'published' | 'draft' | 'archived'
  start_date: string
  end_date: string | null
  cover_url: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export interface ArtworkRecord {
  id: string
  exhibition_id: string
  artist_id: string | null
  title: string
  media_type: 'image' | 'video' | 'audio'
  file_url: string
  thumb_url: string
  price: number | null
  license_type: 'personal' | 'commercial' | null
  polygon_count: number | null
  lod_levels: number | null
  description: string | null
  position_x: number | null
  position_y: number | null
  position_z: number | null
  created_at: string
  updated_at: string
}

export interface TicketRecord {
  id: string
  exhibition_id: string
  type: 'single' | 'season'
  price: number
  max_qty: number
  sold_qty: number
  perks_json: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface OrderRecord {
  id: string
  user_id: string
  status: 'pending' | 'paid' | 'fulfilled' | 'refunded' | 'expired' | 'canceled' | 'failed'
  total: number
  currency: string
  payment_id: string
  created_at: string
}

export interface OrderItemRecord {
  id: string
  order_id: string
  type: 'ticket' | 'merch' | 'license' | 'subscription'
  ref_id: string
  qty: number
  price: number
}

export interface FavoriteRecord {
  id: string
  user_id: string
  artwork_id: string
  created_at: string
}

export interface CartItemRecord {
  id: string
  user_id: string
  type: 'ticket' | 'merch' | 'license' | 'subscription'
  ref_id: string
  title: string
  price: number
  qty: number
  exhibition_id: string | null
  license_type: 'personal' | 'commercial' | null
  created_at: string
  updated_at: string
}

export interface AnalyticsRecord {
  id: string
  session_id: string
  user_id: string | null
  exhibition_id: string | null
  event_type: string
  payload_json: Record<string, unknown> | null
  created_at: string
}

export interface ArtworkWithArtist extends ArtworkRecord {
  artist: Pick<PublicUser, 'id' | 'email' | 'role' | 'avatarUrl'> | null
}

export interface OrderWithItems extends OrderRecord {
  order_items: OrderItemRecord[]
}
