'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface PageTransitionProps {
children: ReactNode
className?: string
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
return (
<div
className={`animate-fade-up opacity-0 ${className}`}
style={{ animationFillMode: 'forwards' }}
>
{children}
</div>
)
}

export function SectionDivider() {
return (
<div className="relative my-8 h-px w-full overflow-hidden bg-border">
<div className="absolute inset-0 animate-aurora bg-gradient-to-r from-transparent via-accent/40 to-transparent bg-[length:200%_100%]" />
</div>
)
}

export function NoiseOverlay() {
const canvasRef = useRef<HTMLCanvasElement>(null)

useEffect(() => {
const canvas = canvasRef.current
if (!canvas) return
const ctx = canvas.getContext('2d')
if (!ctx) return

canvas.width = 256
canvas.height = 256

const drawNoise = () => {
const imageData = ctx.createImageData(256, 256)
const data = imageData.data
for (let i = 0; i < data.length; i += 4) {
const v = Math.random() * 255
data[i] = v
data[i + 1] = v
data[i + 2] = v
data[i + 3] = 8
}
ctx.putImageData(imageData, 0, 0)
}

drawNoise()
const interval = setInterval(drawNoise, 100)
return () => clearInterval(interval)
}, [])

return (
<canvas
ref={canvasRef}
className="pointer-events-none fixed inset-0 z-[99] h-full w-full opacity-[0.03]"
aria-hidden="true"
/>
)
}

export function GlitchText({ text, className = '' }: { text: string; className?: string }) {
const [glitch, setGlitch] = useState(false)

useEffect(() => {
const interval = setInterval(() => {
setGlitch(true)
setTimeout(() => setGlitch(false), 150)
}, 4000 + Math.random() * 3000)
return () => clearInterval(interval)
}, [])

return (
<span
className={`relative inline-block ${className}`}
style={
glitch
? {
textShadow: '-2px 0 #ff6b9d, 2px 0 #00d4ff',
transform: `translate(${(Math.random() - 0.5) * 4}px, ${(Math.random() - 0.5) * 2}px)`,
}
: {}
}
>
{text}
</span>
)
}

export function ParallaxCard({
children,
className = '',
intensity = 10,
}: {
children: ReactNode
className?: string
intensity?: number
}) {
const cardRef = useRef<HTMLDivElement>(null)

const handleMouseMove = (e: React.MouseEvent) => {
const card = cardRef.current
if (!card) return
const rect = card.getBoundingClientRect()
const x = (e.clientX - rect.left) / rect.width - 0.5
const y = (e.clientY - rect.top) / rect.height - 0.5
card.style.transform = `perspective(800px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale(1.02)`
card.style.transition = 'transform 0.1s ease-out'
}

const handleMouseLeave = () => {
const card = cardRef.current
if (!card) return
card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)'
card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
}

return (
<div
ref={cardRef}
onMouseMove={handleMouseMove}
onMouseLeave={handleMouseLeave}
className={className}
>
{children}
</div>
)
}
