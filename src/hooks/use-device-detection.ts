'use client'

import { useEffect, useCallback } from 'react'
import { useUIStore } from '@/stores/ui-store'

function measureFPS(): Promise<number> {
  return new Promise<number>((resolve) => {
    let frameCount = 0
    const startTime = performance.now()
    const measure = (now: number) => {
      frameCount++
      if (now - startTime >= 1000) {
        resolve(Math.round((frameCount * 1000) / (now - startTime)))
        return
      }
      requestAnimationFrame(measure)
    }
    requestAnimationFrame(measure)
  })
}

export function useDeviceDetection() {
  const { setDeviceTier, setMode, setReducedMotion, deviceTier, mode } =
    useUIStore()

  const detect = useCallback(async () => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    setReducedMotion(reducedMotion)

    const cores = navigator.hardwareConcurrency || 2
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    const isLowMemory =
      'deviceMemory' in navigator
        ? (navigator as unknown as { deviceMemory: number }).deviceMemory < 4
        : false

    let tier: 'high' | 'medium' | 'low' = 'high'
    if (isMobile || isLowMemory || cores <= 4) {
      tier = 'medium'
    }
    if (isLowMemory && cores <= 2) {
      tier = 'low'
    }

    if (tier === 'high' && !reducedMotion) {
      const fps = await measureFPS()
      if (fps < 40) {
        tier = 'medium'
      }
    }

    setDeviceTier(tier)

    if (tier === 'low' || reducedMotion) {
      setMode('2.5d')
    } else {
      const saved = sessionStorage.getItem('neogallery-mode')
      if (saved === '2.5d' || saved === '3d') {
        setMode(saved)
      } else {
        setMode(tier === 'high' ? '3d' : '2.5d')
      }
    }
  }, [setDeviceTier, setMode, setReducedMotion])

  useEffect(() => {
    detect()
  }, [detect])

  return { deviceTier, mode }
}
