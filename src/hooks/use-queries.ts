'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient, hasSupabaseConfig } from '@/lib/supabase/client'

const supabase = hasSupabaseConfig() ? createClient() : null

export function useExhibitions(status?: string) {
  return useQuery({
    queryKey: ['exhibitions', status],
    queryFn: async () => {
      if (!supabase) return []
      let query = supabase.from('exhibitions').select('*').order('created_at', { ascending: false })
      if (status) query = query.eq('status', status)
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useExhibition(slug: string) {
  return useQuery({
    queryKey: ['exhibition', slug],
    queryFn: async () => {
      if (!supabase) return null
      const { data, error } = await supabase
        .from('exhibitions')
        .select('*')
        .eq('slug', slug)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!slug && !!supabase,
  })
}

export function useArtworks(exhibitionId: string) {
  return useQuery({
    queryKey: ['artworks', exhibitionId],
    queryFn: async () => {
      if (!supabase) return []
      const { data, error } = await supabase
        .from('artworks')
        .select('*, artists(*)')
        .eq('exhibition_id', exhibitionId)
      if (error) throw error
      return data
    },
    enabled: !!exhibitionId && !!supabase,
  })
}

export function useTickets(exhibitionId: string) {
  return useQuery({
    queryKey: ['tickets', exhibitionId],
    queryFn: async () => {
      if (!supabase) return []
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('exhibition_id', exhibitionId)
      if (error) throw error
      return data
    },
    enabled: !!exhibitionId && !!supabase,
  })
}

export function useOrders(userId: string) {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => {
      if (!supabase) return []
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!userId && !!supabase,
  })
}
