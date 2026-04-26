'use client'

import { useRef, useCallback, ReactNode } from 'react'

interface MagneticProps {
children: ReactNode
className?: string
strength?: number
}

export function Magnetic({ children, className = '', strength = 0.3 }: MagneticProps) {
const ref = useRef<HTMLDivElement>(null)

const handleMouseMove = useCallback(
(e: React.MouseEvent) => {
const el = ref.current
if (!el) return
const rect = el.getBoundingClientRect()
const x = e.clientX - rect.left - rect.width / 2
const y = e.clientY - rect.top - rect.height / 2
el.style.transform = `translate(${x * strength}px, ${y * strength}px)`
},
[strength]
)

const handleMouseLeave = useCallback(() => {
const el = ref.current
if (!el) return
el.style.transform = 'translate(0, 0)'
el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
setTimeout(() => {
if (el) el.style.transition = ''
}, 500)
}, [])

return (
<div
ref={ref}
onMouseMove={handleMouseMove}
onMouseLeave={handleMouseLeave}
className={`inline-block ${className}`}
>
{children}
</div>
)
}
