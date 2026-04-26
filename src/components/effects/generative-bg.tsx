'use client'

import { useEffect, useRef } from 'react'
import { useUIStore } from '@/stores/ui-store'

export function GenerativeBg() {
const canvasRef = useRef<HTMLCanvasElement>(null)
const rafRef = useRef<number>(0)
const { reducedMotion } = useUIStore()

useEffect(() => {
if (reducedMotion) return

const canvas = canvasRef.current
if (!canvas) return
const ctx = canvas.getContext('2d')
if (!ctx) return

const resize = () => {
canvas.width = window.innerWidth
canvas.height = window.innerHeight
}
resize()
window.addEventListener('resize', resize)

const blobs: { x: number; y: number; vx: number; vy: number; size: number; phase: number }[] = Array.from(
{ length: 5 },
() => ({
x: Math.random() * canvas.width,
y: Math.random() * canvas.height,
vx: (Math.random() - 0.5) * 0.5,
vy: (Math.random() - 0.5) * 0.5,
size: Math.random() * 200 + 100,
phase: Math.random() * Math.PI * 2,
})
)

  const draw = () => {
ctx.clearRect(0, 0, canvas.width, canvas.height)

const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#7c5bf5'

for (const blob of blobs) {
blob.x += blob.vx
blob.y += blob.vy
blob.phase += 0.008

if (blob.x < -blob.size) blob.x = canvas.width + blob.size
if (blob.x > canvas.width + blob.size) blob.x = -blob.size
if (blob.y < -blob.size) blob.y = canvas.height + blob.size
if (blob.y > canvas.height + blob.size) blob.y = -blob.size

const s = blob.size + Math.sin(blob.phase) * 30
const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, s)
gradient.addColorStop(0, accentColor + '0a')
gradient.addColorStop(0.5, accentColor + '04')
gradient.addColorStop(1, 'transparent')
ctx.fillStyle = gradient
ctx.fillRect(blob.x - s, blob.y - s, s * 2, s * 2)
}

rafRef.current = requestAnimationFrame(draw)
}

rafRef.current = requestAnimationFrame(draw)

return () => {
window.removeEventListener('resize', resize)
cancelAnimationFrame(rafRef.current)
}
}, [reducedMotion])

if (reducedMotion) return null

return (
<canvas
ref={canvasRef}
className="pointer-events-none fixed inset-0 z-0"
aria-hidden="true"
/>
)
}
