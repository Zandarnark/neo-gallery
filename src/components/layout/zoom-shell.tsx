'use client'

import { usePathname } from 'next/navigation'
import { useUIStore } from '@/stores/ui-store'

export function ZoomShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const zoomPercent = useUIStore((state) => state.zoomPercent)
  const disableScaledLayout = pathname.startsWith('/exhibitions/')

  if (disableScaledLayout || zoomPercent === 100) {
    return <>{children}</>
  }

  return (
    <div
      className="zoom-shell"
      style={{
        zoom: `${zoomPercent}%`,
      }}
    >
      {children}
    </div>
  )
}
