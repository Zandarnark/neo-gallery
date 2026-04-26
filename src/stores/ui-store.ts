import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type DeviceTier = 'high' | 'medium' | 'low'
type Theme = 'dark' | 'light'

interface UIState {
  mode: '3d' | '2.5d'
  theme: Theme
  deviceTier: DeviceTier
  reducedMotion: boolean
  highContrast: boolean
  sidebarOpen: boolean
  artworkModalOpen: boolean
  selectedArtworkId: string | null
  setMode: (mode: '3d' | '2.5d') => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setDeviceTier: (tier: DeviceTier) => void
  setReducedMotion: (v: boolean) => void
  setHighContrast: (v: boolean) => void
  toggleSidebar: () => void
  openArtworkModal: (id: string) => void
  closeArtworkModal: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      mode: '3d',
      theme: 'dark',
      deviceTier: 'high',
      reducedMotion: false,
      highContrast: false,
      sidebarOpen: false,
      artworkModalOpen: false,
      selectedArtworkId: null,
      setMode: (mode) => set({ mode }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setDeviceTier: (tier) => set({ deviceTier: tier }),
      setReducedMotion: (v) => set({ reducedMotion: v }),
      setHighContrast: (v) => set({ highContrast: v }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      openArtworkModal: (id) =>
        set({ artworkModalOpen: true, selectedArtworkId: id }),
      closeArtworkModal: () =>
        set({ artworkModalOpen: false, selectedArtworkId: null }),
    }),
    {
      name: 'neogallery-ui',
      partialize: (state) => ({
        mode: state.mode,
        theme: state.theme,
        highContrast: state.highContrast,
        reducedMotion: state.reducedMotion,
      }),
    }
  )
)
