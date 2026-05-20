'use client'

import { useState, useCallback } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import {
CreditCard,
Shield,
CheckCircle,
XCircle,
Loader2,
ArrowLeft,
Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Confetti } from '@/components/effects/confetti'

type CheckoutStep = 'review' | 'payment' | 'success' | 'failed'

export default function CheckoutPage() {
const { items, total, clearCart } = useCartStore()
const { user } = useAuthStore()

const [step, setStep] = useState<CheckoutStep>('review')
const [isLoading, setIsLoading] = useState(false)
const [selectedMethod, setSelectedMethod] = useState<'card' | 'sbp'>('card')
const [showConfetti, setShowConfetti] = useState(false)
const sum = total()
const isEmpty = items.length === 0

const handlePayment = useCallback(async () => {
if (!user) {
setStep('failed')
return
}

setIsLoading(true)

try {
const res = await fetch('/api/orders', {
method: 'POST',
credentials: 'include',
})

const data = await res.json()

if (data.success) {
await new Promise((r) => setTimeout(r, 1500))
setStep('success')
setShowConfetti(true)
clearCart()
} else {
setStep('failed')
}
} catch {
setStep('failed')
} finally {
setIsLoading(false)
}
}, [user, clearCart])

if (isEmpty && step !== 'success') {
return (
<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
<p className="text-lg text-muted-foreground">Корзина пуста</p>
<Link href="/exhibitions" className="btn-primary">
К выставкам
</Link>
</div>
)
}

if (step === 'success') {
return (
<div className="relative flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center overflow-hidden">
<Confetti active={showConfetti} />

<div className="absolute inset-0 overflow-hidden">
<div className="animate-morph absolute left-1/4 top-1/3 h-40 w-40 bg-success/10 blur-[80px]" />
<div className="animate-morph absolute right-1/4 bottom-1/3 h-60 w-60 bg-accent/10 blur-[100px]" style={{ animationDelay: '2s' }} />
</div>

<motion.div
initial={{ scale: 0, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
>
<CheckCircle className="h-20 w-20 text-success" />
</motion.div>

<motion.h1
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.5, duration: 0.6 }}
className="text-3xl font-bold sm:text-4xl"
>
Оплата прошла успешно!
</motion.h1>

<motion.p
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.7, duration: 0.6 }}
className="max-w-md text-muted-foreground"
>
Ваш заказ оформлен. Билеты и лицензии доступны в личном кабинете.
</motion.p>

<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.9, duration: 0.6 }}
className="flex gap-4"
>
<Link href="/profile" className="btn-primary gap-2">
<Sparkles className="h-4 w-4" />
Личный кабинет
</Link>
<Link href="/exhibitions" className="btn-secondary">
К выставкам
</Link>
</motion.div>
</div>
)
}

if (step === 'failed') {
return (
<div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
<motion.div
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ type: 'spring', stiffness: 200, damping: 15 }}
>
<XCircle className="h-16 w-16 text-destructive" />
</motion.div>
<motion.h1
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.3 }}
className="text-3xl font-bold"
>
Ошибка оплаты
</motion.h1>
<motion.p
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.5 }}
className="max-w-md text-muted-foreground"
>
Не удалось обработать платёж. Попробуйте ещё раз или свяжитесь с
поддержкой.
</motion.p>
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.7 }}
className="flex gap-4"
>
<button
onClick={() => setStep('payment')}
className="btn-primary"
>
Попробовать снова
</button>
<Link href="/cart" className="btn-secondary">
Назад в корзину
</Link>
</motion.div>
</div>
)
}

return (
<div className="px-4 py-12">
<div className="mx-auto max-w-2xl">
<motion.div
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.4 }}
>
<Link
href="/cart"
className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
>
<ArrowLeft className="h-4 w-4" />
Назад в корзину
</Link>
</motion.div>

<motion.h1
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
className="mb-8 text-3xl font-bold"
>
Оформление заказа
</motion.h1>

<AnimatePresence mode="wait">
{step === 'review' && (
<motion.div
key="review"
initial={{ opacity: 0, x: 30 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -30 }}
transition={{ duration: 0.4 }}
className="flex flex-col gap-6"
>
<div className="rounded-xl border border-border bg-card p-6">
<h2 className="mb-4 text-lg font-semibold">Ваш заказ</h2>
<div className="flex flex-col gap-3">
{items.map((item, i) => (
<motion.div
key={item.id}
initial={{ opacity: 0, x: -10 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: i * 0.05 }}
className="flex justify-between text-sm"
>
<span>
{item.title} × {item.qty}
</span>
<span className="font-medium">
{(item.price * item.qty).toLocaleString('ru-RU')} ₽
</span>
</motion.div>
))}
<div className="border-t border-border pt-3">
<div className="flex justify-between text-lg font-bold">
<span>Итого</span>
<span className="text-accent">
{sum.toLocaleString('ru-RU')} ₽
</span>
</div>
</div>
</div>
</div>

<button
onClick={() => setStep('payment')}
className="btn-primary w-full gap-2 py-3"
>
Перейти к оплате
</button>
</motion.div>
)}

{step === 'payment' && (
<motion.div
key="payment"
initial={{ opacity: 0, x: 30 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -30 }}
transition={{ duration: 0.4 }}
className="flex flex-col gap-6"
>
<div className="rounded-xl border border-border bg-card p-6">
<h2 className="mb-4 text-lg font-semibold">Способ оплаты</h2>
<p className="mb-4 text-sm text-muted-foreground">
 Тестовый режим: заказ сразу отмечается как успешно оплаченный
</p>

<div className="flex flex-col gap-3">
<button
onClick={() => setSelectedMethod('card')}
className={`flex items-center gap-3 rounded-lg border p-4 transition-all duration-300 ${
selectedMethod === 'card'
? 'border-accent bg-accent/5 shadow-[0_0_20px_rgba(124,91,245,0.1)]'
: 'border-border hover:border-muted-foreground'
}`}
>
<CreditCard className="h-5 w-5" />
<div className="text-left">
<p className="font-medium">Банковская карта</p>
<p className="text-xs text-muted-foreground">
Тестовая карта: 1111 1111 1111 1026
</p>
</div>
</button>

<button
onClick={() => setSelectedMethod('sbp')}
className={`flex items-center gap-3 rounded-lg border p-4 transition-all duration-300 ${
selectedMethod === 'sbp'
? 'border-accent bg-accent/5 shadow-[0_0_20px_rgba(124,91,245,0.1)]'
: 'border-border hover:border-muted-foreground'
}`}
>
<Shield className="h-5 w-5" />
<div className="text-left">
<p className="font-medium">СБП</p>
<p className="text-xs text-muted-foreground">
Система быстрых платежей
</p>
</div>
</button>
</div>

{selectedMethod === 'card' && (
<motion.div
initial={{ opacity: 0, height: 0 }}
animate={{ opacity: 1, height: 'auto' }}
exit={{ opacity: 0, height: 0 }}
className="mt-4 space-y-3 rounded-lg border border-border bg-muted/30 p-4"
>
<div>
<label className="mb-1 block text-xs text-muted-foreground">
Номер карты
</label>
<input
type="text"
defaultValue="1111 1111 1111 1026"
className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
readOnly
/>
</div>
<div className="grid grid-cols-2 gap-3">
<div>
<label className="mb-1 block text-xs text-muted-foreground">
Срок
</label>
<input
type="text"
defaultValue="09/28"
className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
readOnly
/>
</div>
<div>
<label className="mb-1 block text-xs text-muted-foreground">
CVV
</label>
<input
type="text"
defaultValue="123"
className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
readOnly
/>
</div>
</div>
</motion.div>
)}
</div>

<div className="flex items-center gap-2 text-xs text-muted-foreground">
<Shield className="h-3 w-3" />
 Платежный шлюз здесь отключен: используется локальная заглушка успешной оплаты.
</div>

<button
onClick={handlePayment}
disabled={isLoading}
className="btn-primary w-full gap-2 py-3 disabled:opacity-50"
>
{isLoading ? (
<>
<Loader2 className="h-4 w-4 animate-spin" />
Обработка...
</>
) : (
<>
Оплатить {sum.toLocaleString('ru-RU')} ₽
</>
)}
</button>
</motion.div>
)}
</AnimatePresence>
</div>
</div>
)
}
