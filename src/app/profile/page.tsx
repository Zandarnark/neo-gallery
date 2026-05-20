'use client'

import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useFavorites, useOrders } from '@/hooks/use-api'
import {
User,
Package,
Ticket,
FileText,
LogOut,
BarChart3,
Settings,
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ScrollReveal, StaggerContainer, StaggerItem, CountUp } from '@/components/effects/scroll-reveal'
import { GenerativeBg } from '@/components/effects/generative-bg'

export default function ProfilePage() {
const { user, logout } = useAuthStore()
const router = useRouter()
const { data: ordersData } = useOrders()
const { data: favoritesData } = useFavorites()

useEffect(() => {
if (!user) router.push('/auth/login')
}, [user, router])

if (!user) return null

const orders = (ordersData?.orders ?? []) as Array<{
  id: string
  status: string
  created_at: string
  total: number
  order_items: Array<{ id: string; type: string }>
}>
const favorites = (favoritesData?.favorites ?? []) as Array<{
  id: string
  title: string
  thumb_url: string
}>
const ticketCount = orders.reduce((sum, o) => sum + o.order_items.filter((i) => i.type === 'ticket').length, 0)
const licenseCount = orders.reduce((sum, o) => sum + o.order_items.filter((i) => i.type === 'license').length, 0)

return (
<div className="relative px-4 py-12">
<GenerativeBg />
<div className="relative z-10 mx-auto max-w-4xl">
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
className="mb-8 flex items-center gap-6"
>
<div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent animate-pulse-glow">
<User className="h-8 w-8" />
</div>
<div>
<h1 className="text-2xl font-bold">{user.email}</h1>
<p className="text-sm text-muted-foreground">
Роль:{' '}
{user.role === 'admin'
? 'Администратор'
: user.role === 'artist'
? 'Автор'
: 'Посетитель'}
</p>
</div>
<button
onClick={() => {
logout()
router.push('/')
}}
className="ml-auto btn-secondary gap-2"
>
<LogOut className="h-4 w-4" />
Выйти
</button>
</motion.div>

<StaggerContainer staggerDelay={0.1} className="grid gap-6 md:grid-cols-3">
<StaggerItem>
<div className="card p-6">
<div className="mb-4 flex items-center gap-3">
<Package className="h-5 w-5 text-accent" />
<h2 className="font-semibold">Заказы</h2>
</div>
<p className="text-3xl font-bold">
<CountUp target={orders.length} />
</p>
<p className="text-sm text-muted-foreground">Всего заказов</p>
</div>
</StaggerItem>

<StaggerItem>
<div className="card p-6">
<div className="mb-4 flex items-center gap-3">
<Ticket className="h-5 w-5 text-accent" />
<h2 className="font-semibold">Билеты</h2>
</div>
<p className="text-3xl font-bold">
<CountUp target={ticketCount} />
</p>
<p className="text-sm text-muted-foreground">Активных билетов</p>
</div>
</StaggerItem>

<StaggerItem>
<div className="card p-6">
<div className="mb-4 flex items-center gap-3">
<FileText className="h-5 w-5 text-accent" />
<h2 className="font-semibold">Лицензии</h2>
</div>
<p className="text-3xl font-bold">
<CountUp target={licenseCount} />
</p>
<p className="text-sm text-muted-foreground">Приобретённых лицензий</p>
</div>
</StaggerItem>
</StaggerContainer>

<ScrollReveal delay={0.3}>
<div className="mt-8">
<h2 className="mb-4 text-xl font-semibold">История заказов</h2>
{orders.length === 0 ? (
<p className="py-8 text-center text-muted-foreground">
Заказов пока нет
</p>
) : (
<div className="flex flex-col gap-3">
{orders.map((order, i) => (
<motion.div
key={order.id}
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: i * 0.1 }}
className="card flex items-center gap-4 p-4"
>
<div className="flex-1">
<div className="flex items-center gap-2">
<span className="font-medium">Заказ {order.id}</span>
<span
className={`badge ${
order.status === 'paid'
? 'bg-success/10 text-success'
: order.status === 'pending'
? 'bg-yellow-500/10 text-yellow-600'
: 'bg-destructive/10 text-destructive'
}`}
>
{order.status === 'paid'
? 'Оплачен'
: order.status === 'pending'
? 'Ожидает'
: order.status === 'refunded'
? 'Возврат'
: order.status}
</span>
</div>
<p className="text-sm text-muted-foreground">
{new Date(order.created_at).toLocaleDateString('ru-RU', {
day: 'numeric',
month: 'long',
year: 'numeric',
})}
</p>
</div>
<div className="flex items-center gap-3">
{order.order_items.map((item) => (
<span key={item.id} className="badge bg-muted">
{item.type === 'ticket'
? 'Билет'
: item.type === 'license'
? 'Лицензия'
: String(item.type)}
</span>
))}
</div>
<span className="font-bold">
{order.total.toLocaleString('ru-RU')} ₽
</span>
</motion.div>
))}
</div>
)}
</div>
</ScrollReveal>

<ScrollReveal delay={0.35}>
<div className="mt-8">
<h2 className="mb-4 text-xl font-semibold">Избранное</h2>
{favorites.length === 0 ? (
<p className="text-muted-foreground">Пока ничего не добавлено в избранное</p>
) : (
<div className="grid gap-4 sm:grid-cols-2">
{favorites.map((favorite) => (
<div key={favorite.id} className="card flex items-center gap-4 p-4">
<div
className="h-16 w-16 rounded-lg bg-cover bg-center"
style={{ backgroundImage: `url(${favorite.thumb_url})` }}
/>
<span className="font-medium">{favorite.title}</span>
</div>
))}
</div>
)}
</div>
</ScrollReveal>

{(user.role === 'artist' || user.role === 'admin') && (
<ScrollReveal delay={0.4}>
<div className="mt-8">
<h2 className="mb-4 text-xl font-semibold">Инструменты</h2>
<div className="flex flex-wrap gap-4">
{user.role === 'artist' && (
<Link
href="/dashboard"
className="card flex items-center gap-3 p-4 transition-all hover:shadow-[0_0_20px_rgba(124,91,245,0.1)]"
>
<BarChart3 className="h-5 w-5 text-accent" />
<span>Аналитика автора</span>
</Link>
)}
{user.role === 'admin' && (
<Link
href="/admin"
className="card flex items-center gap-3 p-4 transition-all hover:shadow-[0_0_20px_rgba(124,91,245,0.1)]"
>
<Settings className="h-5 w-5 text-accent" />
<span>Админ-панель</span>
</Link>
)}
</div>
</div>
</ScrollReveal>
)}
</div>
</div>
)
}
