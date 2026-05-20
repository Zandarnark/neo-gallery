'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const refreshUser = useAuthStore((state) => state.refreshUser)
  const user = useAuthStore((state) => state.user)
  const syncWithServer = useCartStore((state) => state.syncWithServer)

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  useEffect(() => {
    if (user) {
      void syncWithServer()
    }
  }, [syncWithServer, user])

  return <>{children}</>
}
