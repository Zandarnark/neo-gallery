'use client'

import { useDeviceDetection } from '@/hooks/use-device-detection'

export function ModeAnnouncer() {
  const { mode } = useDeviceDetection()

  return (
    <div
      className="sr-only"
      role="status"
      aria-live="polite"
    >
      Режим отображения: {mode === '3d' ? '3D иммерсивный' : '2.5D галерея'}
    </div>
  )
}
