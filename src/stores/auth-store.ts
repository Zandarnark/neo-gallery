import { create } from 'zustand'

interface AuthState {
  user: {
    id: string
    email: string
    role: 'visitor' | 'artist' | 'admin'
    avatarUrl: string | null
  } | null
  isLoading: boolean
  setUser: (user: AuthState['user']) => void
  setLoading: (v: boolean) => void
  refreshUser: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  refreshUser: async () => {
    set({ isLoading: true })
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' })
      const data = await response.json()
      set({ user: data.user ?? null, isLoading: false })
    } catch {
      set({ user: null, isLoading: false })
    }
  },
  login: async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка входа')
    }

    set({ user: data.user, isLoading: false })
  },
  register: async (email, password) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка регистрации')
    }

    set({ user: data.user, isLoading: false })
  },
  logout: () => {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => null)
    set({ user: null, isLoading: false })
  },
}))
