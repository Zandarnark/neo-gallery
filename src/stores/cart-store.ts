import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuthStore } from '@/stores/auth-store'

export interface CartItem {
  id: string
  type: 'ticket' | 'merch' | 'license' | 'subscription'
  refId: string
  title: string
  price: number
  qty: number
  exhibitionId?: string
  licenseType?: 'personal' | 'commercial'
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  hasItem: (id: string) => boolean
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  syncWithServer: () => Promise<void>
  total: () => number
  count: () => number
}

async function syncServerCart(items: CartItem[]) {
  const user = useAuthStore.getState().user

  if (!user) {
    return
  }

  await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ items }),
  })
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          const nextItems = existing
            ? state.items.map((i) =>
                i.id === item.id ? { ...i, qty: i.qty + item.qty } : i
              )
            : [...state.items, item]

          void syncServerCart(nextItems)

          if (existing) {
            return { items: nextItems }
          }
          return { items: nextItems }
        }),
      hasItem: (id) => get().items.some((item) => item.id === id),
      removeItem: (id) =>
        set((state) => {
          const nextItems = state.items.filter((i) => i.id !== id)
          void syncServerCart(nextItems)
          return { items: nextItems }
        }),
      updateQty: (id, qty) =>
        set((state) => {
          const nextItems = qty <= 0
            ? state.items.filter((i) => i.id !== id)
            : state.items.map((i) => (i.id === id ? { ...i, qty } : i))
          void syncServerCart(nextItems)
          return { items: nextItems }
        }),
      clearCart: () => {
        void syncServerCart([])
        set({ items: [] })
      },
      syncWithServer: async () => {
        const user = useAuthStore.getState().user

        if (!user) {
          return
        }

        const localItems = get().items

        if (localItems.length > 0) {
          await syncServerCart(localItems)
        }

        const response = await fetch('/api/cart', { credentials: 'include' })
        const data = await response.json()

        if (response.ok) {
          set({ items: data.items ?? [] })
        }
      },
      total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      count: () =>
        get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: 'neogallery-cart' }
  )
)
