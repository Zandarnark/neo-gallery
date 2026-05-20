export type UserRole = 'visitor' | 'artist' | 'admin'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          role: UserRole
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          password_hash: string
          role?: UserRole
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          password_hash?: string
          role?: UserRole
          avatar_url?: string | null
          updated_at?: string
        }
      }
      exhibitions: {
        Row: {
          id: string
          title: string
          slug: string
          status: 'draft' | 'published' | 'archived'
          start_date: string
          end_date: string | null
          cover_url: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          slug: string
          status?: 'draft' | 'published' | 'archived'
          start_date: string
          end_date?: string | null
          cover_url?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          slug?: string
          status?: 'draft' | 'published' | 'archived'
          start_date?: string
          end_date?: string | null
          cover_url?: string | null
          description?: string | null
          updated_at?: string
        }
      }
      artworks: {
        Row: {
          id: string
          exhibition_id: string
          artist_id: string | null
          title: string
          media_type: 'image' | 'video' | 'audio'
          file_url: string
          thumb_url: string | null
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
        Insert: {
          id: string
          exhibition_id: string
          artist_id?: string | null
          title: string
          media_type: 'image' | 'video' | 'audio'
          file_url: string
          thumb_url?: string | null
          price?: number | null
          license_type?: 'personal' | 'commercial' | null
          polygon_count?: number | null
          lod_levels?: number | null
          description?: string | null
          position_x?: number | null
          position_y?: number | null
          position_z?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          exhibition_id?: string
          artist_id?: string | null
          title?: string
          media_type?: 'image' | 'video' | 'audio'
          file_url?: string
          thumb_url?: string | null
          price?: number | null
          license_type?: 'personal' | 'commercial' | null
          polygon_count?: number | null
          lod_levels?: number | null
          description?: string | null
          position_x?: number | null
          position_y?: number | null
          position_z?: number | null
          updated_at?: string
        }
      }
      tickets: {
        Row: {
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
        Insert: {
          id: string
          exhibition_id: string
          type: 'single' | 'season'
          price: number
          max_qty: number
          sold_qty?: number
          perks_json?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          price?: number
          max_qty?: number
          sold_qty?: number
          perks_json?: Record<string, unknown> | null
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'paid' | 'fulfilled' | 'refunded' | 'expired' | 'canceled' | 'failed'
          total: number
          currency: string
          payment_id: string
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          status: 'pending' | 'paid' | 'fulfilled' | 'refunded' | 'expired' | 'canceled' | 'failed'
          total: number
          currency: string
          payment_id: string
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'paid' | 'fulfilled' | 'refunded' | 'expired' | 'canceled' | 'failed'
          payment_id?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          type: 'ticket' | 'merch' | 'license' | 'subscription'
          ref_id: string
          qty: number
          price: number
        }
        Insert: {
          id: string
          order_id: string
          type: 'ticket' | 'merch' | 'license' | 'subscription'
          ref_id: string
          qty: number
          price: number
        }
        Update: {
          qty?: number
          price?: number
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          artwork_id: string
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          artwork_id: string
          created_at?: string
        }
        Update: Record<string, never>
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          type: 'ticket' | 'merch' | 'license' | 'subscription'
          ref_id: string
          title: string
          price: number
          qty: number
          exhibition_id: string | null
          license_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          type: 'ticket' | 'merch' | 'license' | 'subscription'
          ref_id: string
          title: string
          price: number
          qty: number
          exhibition_id?: string | null
          license_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          price?: number
          qty?: number
          exhibition_id?: string | null
          license_type?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          session_id: string
          user_id: string | null
          exhibition_id: string | null
          event_type: string
          payload_json: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id: string
          session_id: string
          user_id?: string | null
          exhibition_id?: string | null
          event_type: string
          payload_json?: Record<string, unknown> | null
          created_at?: string
        }
        Update: Record<string, never>
      }
    }
  }
}
