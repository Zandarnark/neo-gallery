import type { ArtworkWithArtist, ExhibitionRecord, OrderWithItems, PublicUser } from '@/lib/db/types'

export interface TicketDto {
  id: string
  exhibition_id: string
  type: 'single' | 'season'
  price: number
  max_qty: number
  sold_qty: number
  perks_json: Record<string, unknown> | null
}

export interface ExhibitionDetailsDto {
  exhibition: ExhibitionRecord
  artworks: ArtworkWithArtist[]
  tickets: TicketDto[]
}

export interface CartItemDto {
  id: string
  type: 'ticket' | 'merch' | 'license' | 'subscription'
  refId: string
  title: string
  price: number
  qty: number
  exhibitionId?: string
  licenseType?: 'personal' | 'commercial'
}

export interface AuthMeResponse {
  user: PublicUser | null
}

export interface OrdersResponse {
  orders: OrderWithItems[]
}
