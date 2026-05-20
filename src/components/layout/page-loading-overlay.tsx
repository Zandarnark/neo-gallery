'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function PageLoadingOverlay() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const timer = window.setTimeout(() => setVisible(false), pathname.startsWith('/exhibitions/') ? 1200 : 600)
    return () => window.clearTimeout(timer)
  }, [pathname])

  if (!visible) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-background/72 backdrop-blur-sm">
      <div className="rounded-2xl border border-border bg-card px-6 py-4 text-center shadow-2xl">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
        <p className="text-sm font-medium">Загрузка контента...</p>
        <p className="mt-1 text-xs text-muted-foreground">Подготавливаем интерфейс и данные</p>
      </div>
    </div>
  )
}
