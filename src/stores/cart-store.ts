import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  total: () => number
  count: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, qty: i.qty + item.qty } : i
              ),
            }
          }
          return { items: [...state.items, item] }
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQty: (id, qty) =>
        set((state) => ({
          items: qty <= 0
            ? state.items.filter((i) => i.id !== id)
            : state.items.map((i) => (i.id === id ? { ...i, qty } : i)),
        })),
      clearCart: () => set({ items: [] }),
      total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      count: () =>
        get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: 'neogallery-cart' }
  )
)
