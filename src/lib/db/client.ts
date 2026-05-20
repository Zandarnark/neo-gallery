import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

function getEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

declare global {
  // eslint-disable-next-line no-var
  var __neoGallerySupabaseAdmin: SupabaseClient<Database> | undefined
}

export function getSupabaseAdmin() {
  if (!globalThis.__neoGallerySupabaseAdmin) {
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseKey) {
      throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY')
    }

    globalThis.__neoGallerySupabaseAdmin = createClient<Database>(
      getEnv('NEXT_PUBLIC_SUPABASE_URL'),
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }

  return globalThis.__neoGallerySupabaseAdmin
}

export function nowIso() {
  return new Date().toISOString()
}

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}
