import { createId, getSupabaseAdmin } from '@/lib/db/client'
import type { Database } from '@/lib/supabase/types'

export async function logAnalyticsEvent(input: {
  sessionId: string
  userId?: string | null
  exhibitionId?: string | null
  eventType: string
  payload?: unknown
}) {
  const supabase = getSupabaseAdmin()
  const payloadJson =
    input.payload && typeof input.payload === 'object' && !Array.isArray(input.payload)
      ? (input.payload as Record<string, unknown>)
      : null

  const payload: Database['public']['Tables']['analytics_events']['Insert'] = {
    id: createId('evt'),
    session_id: input.sessionId,
    user_id: input.userId ?? null,
    exhibition_id: input.exhibitionId ?? null,
    event_type: input.eventType,
    payload_json: payloadJson,
  }

  const { error } = await supabase
    .from('analytics_events' as never)
    .insert(payload as never)

  if (error) throw error
}
