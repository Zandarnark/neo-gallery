'use client'

import Link from 'next/link'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import {
ShoppingCart,
User,
Palette,
Menu,
X,
Eye,
EyeOff,
Sun,
Moon,
 ZoomIn,
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Header() {
const { count } = useCartStore()
const { user } = useAuthStore()
const { mode, setMode, theme, toggleTheme, highContrast, setHighContrast } = useUIStore()
const [menuOpen, setMenuOpen] = useState(false)
const itemCount = count()

return (
<header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
<nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:py-5">
<Link
href="/"
className="group flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground transition-all sm:text-3xl"
>
<Palette className="h-8 w-8 text-accent transition-transform group-hover:scale-110 group-hover:rotate-12 sm:h-10 sm:w-10" />
<span className="text-gradient-shimmer">NeoGallery</span>
</Link>

<div className="hidden items-center gap-7 md:flex">
{[
{ href: '/exhibitions', label: 'Выставки', show: true },
{ href: '/dashboard', label: 'Кабинет автора', show: user?.role === 'artist' },
{ href: '/admin', label: 'Админ', show: user?.role === 'admin' },
].filter(l => l.show).map((link) => (
<Link
key={link.href}
href={link.href}
className="relative text-base font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
>
{link.label}
</Link>
))}
</div>

<div className="flex items-center gap-2">
<button
onClick={() => setHighContrast(!highContrast)}
className="rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
aria-label={highContrast ? 'Выключить режим для плоховидящих' : 'Включить режим для плоховидящих'}
title="Режим для плоховидящих"
>
<ZoomIn className="h-5 w-5" />
</button>

<button
onClick={() => setMode(mode === '3d' ? '2.5d' : '3d')}
className="rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
aria-label={mode === '3d' ? 'Переключить на 2.5D режим' : 'Переключить на 3D режим'}
title={mode === '3d' ? '2.5D режим' : '3D режим'}
>
{mode === '3d' ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
</button>

<button
onClick={toggleTheme}
className="rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
aria-label={
theme === 'dark'
? 'Переключить на светлую тему'
: 'Переключить на тёмную тему'
}
title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
>
<AnimatePresence mode="wait" initial={false}>
{theme === 'dark' ? (
<motion.div
key="sun"
initial={{ rotate: -90, opacity: 0 }}
animate={{ rotate: 0, opacity: 1 }}
exit={{ rotate: 90, opacity: 0 }}
transition={{ duration: 0.2 }}
>
<Sun className="h-5 w-5" />
</motion.div>
) : (
<motion.div
key="moon"
initial={{ rotate: 90, opacity: 0 }}
animate={{ rotate: 0, opacity: 1 }}
exit={{ rotate: -90, opacity: 0 }}
transition={{ duration: 0.2 }}
>
<Moon className="h-5 w-5" />
</motion.div>
)}
</AnimatePresence>
</button>

<Link
href="/cart"
className="relative rounded-lg p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
aria-label="Корзина"
>
<ShoppingCart className="h-5 w-5" />
<AnimatePresence>
{itemCount > 0 && (
<motion.span
initial={{ scale: 0 }}
animate={{ scale: 1 }}
exit={{ scale: 0 }}
transition={{ type: 'spring', stiffness: 500, damping: 25 }}
className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground"
>
{itemCount}
</motion.span>
)}
</AnimatePresence>
</Link>

<Link
href={user ? '/profile' : '/auth/login'}
className="rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
aria-label={user ? 'Профиль' : 'Войти'}
>
<User className="h-5 w-5" />
</Link>

<button
onClick={() => setMenuOpen(!menuOpen)}
className="rounded-xl p-2.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground md:hidden"
aria-label="Меню"
>
<AnimatePresence mode="wait" initial={false}>
{menuOpen ? (
<motion.div
key="close"
initial={{ rotate: -90, opacity: 0 }}
animate={{ rotate: 0, opacity: 1 }}
exit={{ rotate: 90, opacity: 0 }}
>
<X className="h-5 w-5" />
</motion.div>
) : (
<motion.div
key="menu"
initial={{ rotate: 90, opacity: 0 }}
animate={{ rotate: 0, opacity: 1 }}
exit={{ rotate: -90, opacity: 0 }}
>
<Menu className="h-5 w-5" />
</motion.div>
)}
</AnimatePresence>
</button>
</div>
</nav>

<AnimatePresence>
{menuOpen && (
<motion.div
initial={{ height: 0, opacity: 0 }}
animate={{ height: 'auto', opacity: 1 }}
exit={{ height: 0, opacity: 0 }}
transition={{ duration: 0.3 }}
className="overflow-hidden border-t border-border bg-background/80 backdrop-blur-xl md:hidden"
>
<div className="px-4 py-4">
{[
{ href: '/exhibitions', label: 'Выставки', show: true },
{ href: '/dashboard', label: 'Кабинет автора', show: user?.role === 'artist' },
{ href: '/admin', label: 'Админ', show: user?.role === 'admin' },
].filter(l => l.show).map((link, i) => (
<motion.div
key={link.href}
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: i * 0.1 }}
>
<Link
href={link.href}
className="block py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
onClick={() => setMenuOpen(false)}
>
{link.label}
</Link>
</motion.div>
))}
</div>
</motion.div>
)}
</AnimatePresence>
</header>
)
}
