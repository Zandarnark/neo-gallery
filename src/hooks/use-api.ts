'use client'

import { useQuery } from '@tanstack/react-query'
import type { ExhibitionDetailsDto } from '@/lib/api/types'

export async function readApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  let data = {} as T

  if (text) {
    try {
      data = JSON.parse(text) as T
    } catch {
      throw new Error(response.ok ? 'Сервер вернул некорректный ответ' : 'Сервер вернул ошибку без JSON')
    }
  }

  if (!response.ok) {
    const error =
      typeof data === 'object' && data !== null && 'error' in data
        ? String((data as { error?: unknown }).error ?? 'Request failed')
        : 'Request failed'

    throw new Error(error)
  }

  return data
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include' })
  const data = await readApiResponse<T & { error?: string }>(response)

  return data
}

export function usePublishedExhibitions() {
  return useQuery({
    queryKey: ['api', 'exhibitions', 'published'],
    queryFn: async () => {
      const data = await getJson<{ exhibitions: Array<Record<string, unknown>> }>('/api/exhibitions')
      return data.exhibitions
    },
  })
}

export function useExhibitionDetails(slug: string) {
  return useQuery({
    queryKey: ['api', 'exhibition', slug],
    queryFn: async () => getJson<ExhibitionDetailsDto>(`/api/exhibitions/${slug}`),
    enabled: !!slug,
  })
}

export function useOrders() {
  return useQuery({
    queryKey: ['api', 'orders'],
    queryFn: async () => getJson<{ orders: Array<Record<string, unknown>> }>('/api/orders'),
  })
}

export function useFavorites() {
  return useQuery({
    queryKey: ['api', 'favorites'],
    queryFn: async () => getJson<{ favorites: Array<Record<string, unknown>> }>('/api/favorites'),
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['api', 'admin', 'users'],
    queryFn: async () => getJson<{ users: Array<Record<string, unknown>> }>('/api/admin/users'),
  })
}

export function useAdminExhibitions() {
  return useQuery({
    queryKey: ['api', 'admin', 'exhibitions'],
    queryFn: async () => getJson<{ exhibitions: Array<Record<string, unknown>> }>('/api/admin/exhibitions'),
  })
}

export function useAdminArtworks() {
  return useQuery({
    queryKey: ['api', 'admin', 'artworks'],
    queryFn: async () => getJson<{ artworks: Array<Record<string, unknown>> }>('/api/admin/artworks'),
  })
}

export function useMyArtworks(enabled = true) {
  return useQuery({
    queryKey: ['api', 'artworks', 'mine'],
    queryFn: async () => getJson<{ artworks: Array<Record<string, unknown>> }>('/api/artworks/mine'),
    enabled,
  })
}

export function useManageExhibitions(enabled = true) {
  return useQuery({
    queryKey: ['api', 'exhibitions', 'manage'],
    queryFn: async () => getJson<{ exhibitions: Array<Record<string, unknown>> }>('/api/exhibitions/manage'),
    enabled,
  })
}
