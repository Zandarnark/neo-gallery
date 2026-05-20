'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/stores/ui-store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, highContrast, zoomPercent } = useUIStore()

  useEffect(() => {
    const root = document.documentElement

    root.classList.remove('light', 'dark', 'high-contrast')
    root.classList.add(theme)
    root.style.colorScheme = theme

    if (highContrast) {
      root.classList.add('high-contrast')
    }

    root.style.setProperty('--site-zoom', String(zoomPercent))
  }, [theme, highContrast, zoomPercent])

  return <>{children}</>
}
