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
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null }),
}))
