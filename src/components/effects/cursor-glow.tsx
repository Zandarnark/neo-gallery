'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useUIStore } from '@/stores/ui-store'

interface Particle {
x: number
y: number
vx: number
vy: number
size: number
opacity: number
life: number
maxLife: number
}

export function CursorGlow() {
const canvasRef = useRef<HTMLCanvasElement>(null)
const particlesRef = useRef<Particle[]>([])
const mouseRef = useRef({ x: -100, y: -100 })
const rafRef = useRef<number>(0)
const { reducedMotion } = useUIStore()

const addParticle = useCallback((x: number, y: number) => {
const particles = particlesRef.current
if (particles.length > 40) return
particles.push({
x,
y,
vx: (Math.random() - 0.5) * 1.5,
vy: (Math.random() - 0.5) * 1.5,
size: Math.random() * 3 + 1,
opacity: Math.random() * 0.5 + 0.3,
life: 0,
maxLife: Math.random() * 40 + 20,
})
}, [])

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

let lastMouse = { x: -100, y: -100 }

const onMouseMove = (e: MouseEvent) => {
mouseRef.current = { x: e.clientX, y: e.clientY }
const dx = e.clientX - lastMouse.x
const dy = e.clientY - lastMouse.y
const speed = Math.sqrt(dx * dx + dy * dy)
if (speed > 3) {
for (let i = 0; i < Math.min(speed / 8, 3); i++) {
addParticle(e.clientX, e.clientY)
}
}
lastMouse = { x: e.clientX, y: e.clientY }
}

window.addEventListener('mousemove', onMouseMove)

const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#7c5bf5'

const draw = () => {
ctx.clearRect(0, 0, canvas.width, canvas.height)

const { x, y } = mouseRef.current

const gradient = ctx.createRadialGradient(x, y, 0, x, y, 200)
gradient.addColorStop(0, accentColor + '12')
gradient.addColorStop(0.5, accentColor + '06')
gradient.addColorStop(1, 'transparent')
ctx.fillStyle = gradient
ctx.fillRect(0, 0, canvas.width, canvas.height)

const particles = particlesRef.current
for (let i = particles.length - 1; i >= 0; i--) {
const p = particles[i]
p.life++
p.x += p.vx
p.y += p.vy
p.opacity *= 0.97

if (p.life >= p.maxLife || p.opacity < 0.01) {
particles.splice(i, 1)
continue
}

ctx.beginPath()
ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
ctx.fillStyle = accentColor + Math.floor(p.opacity * 255).toString(16).padStart(2, '0')
ctx.fill()
}

rafRef.current = requestAnimationFrame(draw)
}

rafRef.current = requestAnimationFrame(draw)

return () => {
window.removeEventListener('resize', resize)
window.removeEventListener('mousemove', onMouseMove)
cancelAnimationFrame(rafRef.current)
}
}, [reducedMotion, addParticle])

if (reducedMotion) return null

return (
<canvas
ref={canvasRef}
className="pointer-events-none fixed inset-0 z-[100] opacity-70"
aria-hidden="true"
/>
)
}
