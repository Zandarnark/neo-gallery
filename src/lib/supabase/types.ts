export type UserRole = 'visitor' | 'artist' | 'admin'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          created_at: string
          avatar_url: string | null
        }
        Insert: {
          id: string
          email: string
          role?: UserRole
          created_at?: string
          avatar_url?: string | null
        }
        Update: {
          email?: string
          role?: UserRole
          avatar_url?: string | null
        }
      }
      artists: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          payout_account: string | null
          tier: 'free' | 'pro' | 'premium'
        }
        Insert: {
          user_id: string
          bio?: string | null
          payout_account?: string | null
          tier?: 'free' | 'pro' | 'premium'
        }
        Update: {
          bio?: string | null
          payout_account?: string | null
          tier?: 'free' | 'pro' | 'premium'
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
        }
        Insert: {
          title: string
          slug: string
          status?: 'draft' | 'published' | 'archived'
          start_date: string
          end_date?: string | null
          cover_url?: string | null
          description?: string | null
        }
        Update: {
          title?: string
          slug?: string
          status?: 'draft' | 'published' | 'archived'
          start_date?: string
          end_date?: string | null
          cover_url?: string | null
          description?: string | null
        }
      }
      artworks: {
        Row: {
          id: string
          exhibition_id: string
          artist_id: string
          title: string
          media_type: 'image' | 'video' | 'audio'
          file_url: string
          thumb_url: string | null
          price: number | null
          license_type: 'personal' | 'commercial' | null
          polygon_count: number | null
          lod_levels: number | null
          description: string | null
          position_x: number
          position_y: number
          position_z: number
        }
        Insert: {
          exhibition_id: string
          artist_id: string
          title: string
          media_type: 'image' | 'video' | 'audio'
          file_url: string
          thumb_url?: string | null
          price?: number | null
          license_type?: 'personal' | 'commercial' | null
          polygon_count?: number | null
          lod_levels?: number | null
          description?: string | null
          position_x?: number
          position_y?: number
          position_z?: number
        }
        Update: {
          title?: string
          media_type?: 'image' | 'video' | 'audio'
          file_url?: string
          thumb_url?: string | null
          price?: number | null
          license_type?: 'personal' | 'commercial' | null
          description?: string | null
          position_x?: number
          position_y?: number
          position_z?: number
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
        }
        Insert: {
          exhibition_id: string
          type: 'single' | 'season'
          price: number
          max_qty?: number
          perks_json?: Record<string, unknown> | null
        }
        Update: {
          price?: number
          max_qty?: number
          sold_qty?: number
          perks_json?: Record<string, unknown> | null
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: 'pending' | 'paid' | 'fulfilled' | 'refunded' | 'expired' | 'canceled' | 'failed'
          total: number
          currency: string
          payment_id: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          status?: 'pending' | 'paid' | 'fulfilled' | 'refunded' | 'expired' | 'canceled' | 'failed'
          total: number
          currency?: string
          payment_id?: string | null
        }
        Update: {
          status?: 'pending' | 'paid' | 'fulfilled' | 'refunded' | 'expired' | 'canceled' | 'failed'
          payment_id?: string | null
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
          order_id: string
          type: 'ticket' | 'merch' | 'license' | 'subscription'
          ref_id: string
          qty?: number
          price: number
        }
        Update: {
          qty?: number
          price?: number
        }
      }
    analytics: {
      Row: {
        id: string
        session_id: string
        exhibition_id: string | null
        event_type: string
        payload: Record<string, unknown> | null
        created_at: string
      }
      Insert: {
        session_id: string
        exhibition_id?: string | null
        event_type: string
        payload?: Record<string, unknown> | null
      }
      Update: {
        payload?: Record<string, unknown> | null
      }
    }
    payments_audit: {
      Row: {
        id: string
        payment_id: string
        event_type: string
        status_before: string | null
        status_after: string | null
        webhook_received_at: string
      }
      Insert: {
        payment_id: string
        event_type: string
        status_before?: string | null
        status_after?: string | null
        webhook_received_at?: string
      }
      Update: Record<string, never>
    }
    }
  }
}
