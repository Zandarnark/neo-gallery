'use client'

import { useEffect, useRef } from 'react'
import { useUIStore } from '@/stores/ui-store'

export function AmbientParticles() {
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

interface Star {
x: number
y: number
size: number
speed: number
opacity: number
pulse: number
pulseSpeed: number
}

const stars: Star[] = Array.from({ length: 60 }, () => ({
x: Math.random() * canvas.width,
y: Math.random() * canvas.height,
size: Math.random() * 1.8 + 0.3,
speed: Math.random() * 0.3 + 0.05,
opacity: Math.random() * 0.6 + 0.1,
pulse: Math.random() * Math.PI * 2,
pulseSpeed: Math.random() * 0.02 + 0.005,
}))

const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#7c5bf5'

const draw = () => {
ctx.clearRect(0, 0, canvas.width, canvas.height)

for (const star of stars) {
star.pulse += star.pulseSpeed
star.y -= star.speed
star.opacity = 0.15 + Math.sin(star.pulse) * 0.15

if (star.y < -10) {
star.y = canvas.height + 10
star.x = Math.random() * canvas.width
}

ctx.beginPath()
ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
ctx.fillStyle = accentColor + Math.floor(star.opacity * 255).toString(16).padStart(2, '0')
ctx.fill()

if (star.size > 1) {
const glow = ctx.createRadialGradient(
star.x, star.y, 0,
star.x, star.y, star.size * 4
)
glow.addColorStop(0, accentColor + '08')
glow.addColorStop(1, 'transparent')
ctx.fillStyle = glow
ctx.fillRect(star.x - star.size * 4, star.y - star.size * 4, star.size * 8, star.size * 8)
}
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
