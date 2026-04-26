'use client'

import { useCallback, ReactNode } from 'react'

interface RippleProps {
children: ReactNode
className?: string
color?: string
}

export function RippleButton({ children, className = '', color }: RippleProps) {
const handleClick = useCallback(
(e: React.MouseEvent<HTMLButtonElement>) => {
const btn = e.currentTarget
const rect = btn.getBoundingClientRect()
const size = Math.max(rect.width, rect.height)
const x = e.clientX - rect.left - size / 2
const y = e.clientY - rect.top - size / 2

const ripple = document.createElement('span')
ripple.style.cssText = `
position: absolute;
width: ${size}px;
height: ${size}px;
left: ${x}px;
top: ${y}px;
background: ${color || 'rgba(255,255,255,0.3)'};
border-radius: 50%;
transform: scale(0);
animation: ripple 0.6s ease-out;
pointer-events: none;
`
btn.style.position = 'relative'
btn.style.overflow = 'hidden'
btn.appendChild(ripple)
setTimeout(() => ripple.remove(), 600)
},
[color]
)

return (
<button onClick={handleClick} className={className}>
{children}
</button>
)
}
