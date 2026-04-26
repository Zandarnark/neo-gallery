'use client'

import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { mockExhibitions, mockArtworks } from '@/lib/mock-data'
import {
Settings,
Plus,
Edit3,
Eye,
Trash2,
BarChart3,
DollarSign,
Users,
Image as ImageIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { ScrollReveal, StaggerContainer, StaggerItem, CountUp } from '@/components/effects/scroll-reveal'
import { GenerativeBg } from '@/components/effects/generative-bg'

export default function AdminPage() {
const { user } = useAuthStore()
const router = useRouter()

useEffect(() => {
if (!user || user.role !== 'admin') {
router.push('/auth/login')
}
}, [user, router])

if (!user) return null

const publishedExhibitions = mockExhibitions.filter(
(e) => e.status === 'published'
)
const totalArtworks = mockArtworks.length
const totalRevenue = 284900
const totalUsers = 1243
const ticketCounts: Record<string, number> = {
'b0000000-0000-0000-0000-000000000001': 127,
'b0000000-0000-0000-0000-000000000002': 89,
'b0000000-0000-0000-0000-000000000003': 0,
}

const adminStats = [
{ icon: ImageIcon, label: 'Выставки', value: mockExhibitions.length, sub: `Активных: ${publishedExhibitions.length}` },
{ icon: Settings, label: 'Работы', value: totalArtworks, sub: 'Всего в системе' },
{ icon: DollarSign, label: 'Доход', value: totalRevenue, suffix: ' ₽', sub: 'За всё время' },
{ icon: Users, label: 'Пользователи', value: totalUsers, sub: 'Зарегистрированных' },
]

return (
<div className="relative px-4 py-12">
<GenerativeBg />
<div className="relative z-10 mx-auto max-w-6xl">
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
className="mb-8 flex items-center justify-between"
>
<div>
<h1 className="text-3xl font-bold">Админ-панель</h1>
<p className="text-muted-foreground">
Управление выставками, работами и монетизацией
</p>
</div>
<button className="btn-primary gap-2 transition-all hover:shadow-[0_0_20px_rgba(124,91,245,0.2)]">
<Plus className="h-4 w-4" />
Новая выставка
</button>
</motion.div>

<StaggerContainer staggerDelay={0.1} className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
{adminStats.map((stat) => (
<StaggerItem key={stat.label}>
<div className="card p-5 group">
<div className="mb-3 flex items-center gap-2">
<stat.icon className="h-4 w-4 text-accent transition-transform group-hover:scale-110" />
<span className="text-sm text-muted-foreground">{stat.label}</span>
</div>
<p className="text-2xl font-bold">
<CountUp target={stat.value} suffix={stat.suffix || ''} />
</p>
<p className="mt-1 text-xs text-muted-foreground">
{stat.sub}
</p>
</div>
</StaggerItem>
))}
</StaggerContainer>

<ScrollReveal delay={0.2}>
<div className="mb-8">
<div className="mb-4 flex items-center justify-between">
<h2 className="text-xl font-semibold">Выставки</h2>
</div>
<div className="overflow-x-auto rounded-xl border border-border bg-card">
<table className="w-full text-left text-sm">
<thead>
<tr className="border-b border-border bg-muted/30">
<th className="p-4 font-medium text-muted-foreground">Название</th>
<th className="p-4 font-medium text-muted-foreground">Статус</th>
<th className="p-4 font-medium text-muted-foreground">Работы</th>
<th className="p-4 font-medium text-muted-foreground">Билеты</th>
<th className="p-4 font-medium text-muted-foreground">Действия</th>
</tr>
</thead>
<tbody>
{mockExhibitions.map((exhibition, i) => {
const artworkCount = mockArtworks.filter(
(a) => a.exhibition_id === exhibition.id
).length
return (
<motion.tr
key={exhibition.id}
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: i * 0.08 }}
className="border-b border-border/50 transition-colors hover:bg-muted/20"
>
<td className="p-4 font-medium">{exhibition.title}</td>
<td className="p-4">
<span
className={`badge ${
exhibition.status === 'published'
? 'bg-success/10 text-success'
: exhibition.status === 'draft'
? 'bg-yellow-500/10 text-yellow-600'
: 'bg-muted text-muted-foreground'
}`}
>
{exhibition.status === 'published'
? 'Опубликована'
: exhibition.status === 'draft'
? 'Черновик'
: 'Архив'}
</span>
</td>
<td className="p-4">{artworkCount}</td>
<td className="p-4">
{exhibition.status === 'published'
? ticketCounts[exhibition.id] ?? 0
: '—'}
</td>
<td className="p-4">
<div className="flex items-center gap-2">
<button
className="rounded p-1 text-muted-foreground transition-all hover:text-foreground hover:bg-muted"
aria-label="Редактировать"
>
<Edit3 className="h-4 w-4" />
</button>
<button
className="rounded p-1 text-muted-foreground transition-all hover:text-foreground hover:bg-muted"
aria-label="Просмотр"
>
<Eye className="h-4 w-4" />
</button>
<button
className="rounded p-1 text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10"
aria-label="Удалить"
>
<Trash2 className="h-4 w-4" />
</button>
</div>
</td>
</motion.tr>
)
})}
</tbody>
</table>
</div>
</div>
</ScrollReveal>

<ScrollReveal delay={0.3}>
<div className="card p-6 shadow-[0_0_30px_rgba(124,91,245,0.05)]">
<div className="mb-4 flex items-center gap-2">
<BarChart3 className="h-5 w-5 text-accent" />
<h2 className="text-lg font-semibold">Общие метрики</h2>
</div>
<div className="grid gap-4 sm:grid-cols-3">
{[
{ label: 'Конверсия оплаты', value: '4.2%' },
{ label: 'Успешность платежей', value: '98.1%' },
{ label: 'Средний чек', value: '1 347 ₽' },
].map((metric) => (
<div key={metric.label} className="rounded-lg border border-border/50 p-3 transition-colors hover:border-accent/30">
<p className="mb-1 text-sm text-muted-foreground">
{metric.label}
</p>
<p className="text-xl font-bold">{metric.value}</p>
</div>
))}
</div>
</div>
</ScrollReveal>
</div>
</div>
)
}
