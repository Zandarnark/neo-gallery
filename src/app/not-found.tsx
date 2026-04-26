'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function NotFound() {
return (
<div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
<div className="absolute inset-0 overflow-hidden">
<div className="animate-drift absolute -left-20 top-1/4 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
<div className="animate-drift absolute -right-20 bottom-1/4 h-60 w-60 rounded-full bg-accent/5 blur-3xl" style={{ animationDelay: '2s' }} />
<div className="animate-float absolute left-1/4 top-1/3 h-3 w-3 rounded-full bg-accent/30" />
<div className="animate-float-delayed absolute right-1/3 top-1/2 h-2 w-2 rounded-full bg-accent/20" />
<div className="animate-drift absolute bottom-1/3 left-1/2 h-4 w-4 rounded-full bg-accent/15" style={{ animationDelay: '4s' }} />
</div>

<motion.div
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
className="relative z-10"
>
<div className="mb-8 relative">
<span className="text-[12rem] font-bold leading-none text-gradient-shimmer sm:text-[16rem]">
404
</span>
<div className="absolute inset-0 animate-pulse-glow rounded-full opacity-30" />
</div>

<motion.h1
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.3, duration: 0.6 }}
className="mb-4 text-2xl font-bold sm:text-3xl"
>
Страница не найдена
</motion.h1>

<motion.p
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.5, duration: 0.6 }}
className="mb-8 max-w-md text-muted-foreground"
>
Возможно, эта выставка уже закрылась или работа была перемещена в другой зал
</motion.p>

<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.7, duration: 0.6 }}
className="flex flex-wrap items-center justify-center gap-4"
>
<Link href="/" className="btn-primary px-8 py-3">
На главную
</Link>
<Link href="/exhibitions" className="btn-secondary px-8 py-3">
К выставкам
</Link>
</motion.div>
</motion.div>

<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
</div>
)
}
