'use client'

import { useCartStore } from '@/stores/cart-store'
import Link from 'next/link'
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollReveal } from '@/components/effects/scroll-reveal'
import { Magnetic } from '@/components/effects/magnetic'

export default function CartPage() {
const { items, removeItem, updateQty, clearCart, total } = useCartStore()
const sum = total()
const isEmpty = items.length === 0

return (
<div className="px-4 py-12">
<div className="mx-auto max-w-3xl">
<ScrollReveal>
<h1 className="mb-8 text-3xl font-bold">Корзина</h1>
</ScrollReveal>

{isEmpty ? (
<motion.div
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.5 }}
className="flex flex-col items-center gap-4 py-20 text-center"
>
<div className="relative">
<ShoppingCart className="h-16 w-16 text-muted-foreground/20" />
<div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse-glow rounded-full bg-accent/40" />
</div>
<p className="text-lg text-muted-foreground">
Корзина пуста
</p>
<Magnetic strength={0.15}>
<Link href="/exhibitions" className="btn-primary gap-2">
Перейти к выставкам
<ArrowRight className="h-4 w-4" />
</Link>
</Magnetic>
</motion.div>
) : (
<>
<div className="flex flex-col gap-4">
<AnimatePresence mode="popLayout">
{items.map((item, i) => (
<motion.div
key={item.id}
layout
initial={{ opacity: 0, x: -30, scale: 0.95 }}
animate={{ opacity: 1, x: 0, scale: 1 }}
exit={{ opacity: 0, x: 30, scale: 0.9, height: 0, marginBottom: 0 }}
transition={{
layout: { type: 'spring', stiffness: 300, damping: 30 },
duration: 0.3,
}}
className="card flex items-center gap-4 p-4"
style={{ animationDelay: `${i * 0.05}s` }}
>
<div className="flex-1">
<h3 className="font-semibold">{item.title}</h3>
<div className="flex items-center gap-2 text-sm text-muted-foreground">
<span className="badge bg-muted">
{item.type === 'ticket'
? 'Билет'
: item.type === 'license'
? 'Лицензия'
: item.type === 'merch'
? 'Мерч'
: 'Подписка'}
</span>
{item.licenseType && (
<span>
{item.licenseType === 'commercial'
? 'Коммерческая'
: 'Персональная'}
</span>
)}
</div>
</div>

<div className="flex items-center gap-2">
<button
onClick={() => updateQty(item.id, item.qty - 1)}
className="rounded-md border border-border p-1 transition-colors hover:bg-muted hover:border-accent/30"
aria-label="Уменьшить количество"
>
<Minus className="h-3 w-3" />
</button>
<motion.span
key={item.qty}
initial={{ scale: 1.3, color: 'var(--accent)' }}
animate={{ scale: 1, color: 'var(--foreground)' }}
transition={{ duration: 0.3 }}
className="w-8 text-center text-sm font-medium"
>
{item.qty}
</motion.span>
<button
onClick={() => updateQty(item.id, item.qty + 1)}
className="rounded-md border border-border p-1 transition-colors hover:bg-muted hover:border-accent/30"
aria-label="Увеличить количество"
>
<Plus className="h-3 w-3" />
</button>
</div>

<div className="w-24 text-right">
<span className="font-bold">
{(item.price * item.qty).toLocaleString('ru-RU')} ₽
</span>
</div>

<button
onClick={() => removeItem(item.id)}
className="rounded-md p-2 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive hover:scale-110"
aria-label="Удалить"
>
<Trash2 className="h-4 w-4" />
</button>
</motion.div>
))}
</AnimatePresence>
</div>

<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.3 }}
className="mt-8 rounded-xl border border-border bg-card p-6 shadow-[0_0_30px_rgba(124,91,245,0.05)]"
>
<div className="mb-4 flex items-center justify-between">
<span className="text-lg font-semibold">Итого</span>
<motion.span
key={sum}
initial={{ scale: 1.1 }}
animate={{ scale: 1 }}
className="text-2xl font-bold text-accent"
>
{sum.toLocaleString('ru-RU')} ₽
</motion.span>
</div>
<div className="flex gap-4">
<Magnetic strength={0.1}>
<Link
href="/checkout"
className="btn-primary flex-1 py-3 text-center"
>
Оформить заказ
</Link>
</Magnetic>
<button
onClick={clearCart}
className="btn-secondary px-4 py-3"
>
Очистить
</button>
</div>
</motion.div>
</>
)}
</div>
</div>
)
}
