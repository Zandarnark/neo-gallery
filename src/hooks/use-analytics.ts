'use client'

import { useCallback } from 'react'

export function useAnalytics() {
  const sessionId =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('neogallery-session') ||
        (() => {
          const id = crypto.randomUUID()
          sessionStorage.setItem('neogallery-session', id)
          return id
        })()
      : ''

  const log = useCallback(
    async (
      eventType: string,
      exhibitionId?: string,
      payload?: Record<string, unknown>
    ) => {
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            exhibition_id: exhibitionId || null,
            event_type: eventType,
            payload: payload || null,
          }),
        })
      } catch {}
    },
    [sessionId]
  )

  return { log }
}
