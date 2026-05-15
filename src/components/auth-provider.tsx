'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { createClient, hasSupabaseConfig } from '@/lib/supabase/client'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            setUser(
              data
                ? {
                    id: data.id,
                    email: data.email,
                    role: data.role,
                    avatarUrl: data.avatar_url,
                  }
                : null
            )
          })
      } else {
        setUser(null)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setUser(
              data
                ? {
                    id: data.id,
                    email: data.email,
                    role: data.role,
                    avatarUrl: data.avatar_url,
                  }
                : null
            )
          })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading])

  return <>{children}</>
}
