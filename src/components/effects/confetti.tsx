'use client'

import { useEffect, useState, useCallback } from 'react'

interface ConfettiPiece {
id: number
x: number
color: string
size: number
delay: number
duration: number
rotation: number
}

export function Confetti({ active }: { active: boolean }) {
const [pieces, setPieces] = useState<ConfettiPiece[]>([])

const createPieces = useCallback(() => {
const colors = ['#7c5bf5', '#ff6b9d', '#00d4ff', '#ffd700', '#22c55e', '#f97316', '#e879f9']
return Array.from({ length: 50 }, (_, i) => ({
id: i,
x: Math.random() * 100,
color: colors[Math.floor(Math.random() * colors.length)],
size: Math.random() * 8 + 4,
delay: Math.random() * 0.5,
duration: Math.random() * 2 + 2,
rotation: Math.random() * 360,
}))
}, [])

useEffect(() => {
if (active) {
setPieces(createPieces())
const timer = setTimeout(() => setPieces([]), 4000)
return () => clearTimeout(timer)
}
}, [active, createPieces])

if (pieces.length === 0) return null

return (
<div className="pointer-events-none fixed inset-0 z-[200]" aria-hidden="true">
{pieces.map((piece) => (
<div
key={piece.id}
className="absolute"
style={{
left: `${piece.x}%`,
top: '-20px',
width: `${piece.size}px`,
height: `${piece.size}px`,
backgroundColor: piece.color,
borderRadius: Math.random() > 0.5 ? '50%' : '2px',
animation: `confetti-fall ${piece.duration}s ease-in ${piece.delay}s forwards`,
transform: `rotate(${piece.rotation}deg)`,
}}
/>
))}
</div>
)
}
