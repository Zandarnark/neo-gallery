'use client'

import { useRef, useEffect, ReactNode } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'

type RevealDirection = 'up' | 'left' | 'right' | 'scale'

interface ScrollRevealProps {
children: ReactNode
direction?: RevealDirection
delay?: number
duration?: number
className?: string
once?: boolean
}

const variants: Record<RevealDirection, Variants> = {
up: {
hidden: { opacity: 0, y: 40 },
visible: { opacity: 1, y: 0 },
},
left: {
hidden: { opacity: 0, x: -40 },
visible: { opacity: 1, x: 0 },
},
right: {
hidden: { opacity: 0, x: 40 },
visible: { opacity: 1, x: 0 },
},
scale: {
hidden: { opacity: 0, scale: 0.9 },
visible: { opacity: 1, scale: 1 },
},
}

export function ScrollReveal({
children,
direction = 'up',
delay = 0,
duration = 0.7,
className = '',
once = true,
}: ScrollRevealProps) {
const ref = useRef<HTMLDivElement>(null)
const isInView = useInView(ref, { once, margin: '-60px' })

return (
<motion.div
ref={ref}
initial="hidden"
animate={isInView ? 'visible' : 'hidden'}
variants={variants[direction]}
transition={{
duration,
delay,
ease: [0.16, 1, 0.3, 1],
}}
className={className}
>
{children}
</motion.div>
)
}

export function StaggerContainer({
children,
className = '',
staggerDelay = 0.1,
once = true,
}: {
children: ReactNode
className?: string
staggerDelay?: number
once?: boolean
}) {
const ref = useRef<HTMLDivElement>(null)
const isInView = useInView(ref, { once, margin: '-40px' })

return (
<motion.div
ref={ref}
initial="hidden"
animate={isInView ? 'visible' : 'hidden'}
variants={{
hidden: {},
visible: {
transition: {
staggerChildren: staggerDelay,
},
},
}}
className={className}
>
{children}
</motion.div>
)
}

export function StaggerItem({
children,
className = '',
direction = 'up',
}: {
children: ReactNode
className?: string
direction?: RevealDirection
}) {
return (
<motion.div
variants={{
...variants[direction],
visible: {
...variants[direction].visible,
transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
},
}}
className={className}
>
{children}
</motion.div>
)
}

export function TextReveal({
text,
className = '',
delay = 0,
}: {
text: string
className?: string
delay?: number
}) {
const ref = useRef<HTMLDivElement>(null)
const isInView = useInView(ref, { once: true, margin: '-40px' })

return (
<div ref={ref} className={`overflow-hidden ${className}`}>
<motion.div
initial={{ y: '100%' }}
animate={isInView ? { y: 0 } : { y: '100%' }}
transition={{
duration: 0.8,
delay,
ease: [0.16, 1, 0.3, 1],
}}
>
{text}
</motion.div>
</div>
)
}

export function CountUp({
target,
duration = 2,
suffix = '',
className = '',
}: {
target: number
duration?: number
suffix?: string
className?: string
}) {
const ref = useRef<HTMLSpanElement>(null)
const isInView = useInView(ref, { once: true })
const hasAnimated = useRef(false)

useEffect(() => {
if (!isInView || hasAnimated.current) return
hasAnimated.current = true

const el = ref.current
if (!el) return

    const startTime = performance.now()
const step = (now: number) => {
const progress = Math.min((now - startTime) / (duration * 1000), 1)
const eased = 1 - Math.pow(1 - progress, 3)
const current = Math.floor(eased * target)
el.textContent = current.toLocaleString('ru-RU') + suffix
if (progress < 1) {
requestAnimationFrame(step)
} else {
el.textContent = target.toLocaleString('ru-RU') + suffix
}
}
requestAnimationFrame(step)
}, [isInView, target, duration, suffix])

return <span ref={ref} className={className}>0{suffix}</span>
}
