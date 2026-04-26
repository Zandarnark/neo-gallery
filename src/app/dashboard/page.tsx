'use client'

import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { mockArtworks } from '@/lib/mock-data'
import { BarChart3, Eye, ShoppingCart, TrendingUp, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { ScrollReveal, StaggerContainer, StaggerItem, CountUp } from '@/components/effects/scroll-reveal'
import { GenerativeBg } from '@/components/effects/generative-bg'
import { ParallaxCard } from '@/components/effects/page-transitions'

export default function DashboardPage() {
const { user } = useAuthStore()
const router = useRouter()

useEffect(() => {
if (!user || (user.role !== 'artist' && user.role !== 'admin')) {
router.push('/auth/login')
}
}, [user, router])

if (!user) return null

const artistWorks = mockArtworks.filter((a) => a.artist_id === 'a2')
const totalRevenue = artistWorks.reduce((sum, a) => sum + (a.price || 0), 0)
const totalViews = 1847
const conversionRate = 3.7

const stats = [
{ icon: Eye, label: 'Просмотры', value: totalViews, change: '+12% за неделю', color: 'text-accent' },
{ icon: ShoppingCart, label: 'Продажи', value: 23, change: '+8% за неделю', color: 'text-success' },
{ icon: BarChart3, label: 'Конверсия', value: conversionRate, suffix: '%', change: 'Цель: ≥ 3.5%', color: 'text-accent' },
{ icon: Users, label: 'Доход', value: totalRevenue, suffix: ' ₽', change: 'За всё время', color: 'text-accent' },
]

return (
<div className="relative px-4 py-12">
<GenerativeBg />
<div className="relative z-10 mx-auto max-w-6xl">
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
>
<h1 className="mb-2 text-3xl font-bold">Кабинет автора</h1>
<p className="mb-8 text-muted-foreground">
Аналитика и управление вашими работами
</p>
</motion.div>

<StaggerContainer staggerDelay={0.1} className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
{stats.map((stat) => (
<StaggerItem key={stat.label}>
<div className="card p-5 group">
<div className="mb-3 flex items-center gap-2">
<stat.icon className={`h-4 w-4 ${stat.color} transition-transform group-hover:scale-110`} />
<span className="text-sm text-muted-foreground">{stat.label}</span>
</div>
<p className="text-2xl font-bold">
<CountUp target={stat.value} suffix={stat.suffix || ''} />
</p>
<p className={`mt-1 flex items-center gap-1 text-xs ${stat.color === 'text-success' ? 'text-success' : 'text-muted-foreground'}`}>
{stat.color === 'text-success' && <TrendingUp className="h-3 w-3" />}
{stat.change}
</p>
</div>
</StaggerItem>
))}
</StaggerContainer>

<ScrollReveal delay={0.2}>
<div className="mb-8">
<h2 className="mb-4 text-xl font-semibold">Ваши работы</h2>
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
{artistWorks.map((artwork, i) => (
<motion.div
key={artwork.id}
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: i * 0.1 }}
>
<ParallaxCard intensity={5}>
<div className="card group overflow-hidden">
<div
className="aspect-video w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
style={{ backgroundImage: `url(${artwork.thumb_url})` }}
/>
<div className="p-4">
<h3 className="font-semibold transition-colors group-hover:text-accent">{artwork.title}</h3>
<div className="mt-2 flex items-center justify-between text-sm">
<span className="text-muted-foreground">
{artwork.media_type === '3d'
? '3D модель'
: artwork.media_type === 'video'
? 'Видео'
: artwork.media_type === 'audio'
? 'Аудио'
: 'Изображение'}
</span>
<span className="font-bold text-accent">
{artwork.price?.toLocaleString('ru-RU')} ₽
</span>
</div>
</div>
</div>
</ParallaxCard>
</motion.div>
))}
</div>
</div>
</ScrollReveal>

<ScrollReveal delay={0.3}>
<div className="card p-6 shadow-[0_0_30px_rgba(124,91,245,0.05)]">
<h2 className="mb-4 text-lg font-semibold">Метрики вовлечённости</h2>
<div className="grid gap-4 sm:grid-cols-2">
{[
{ label: 'Среднее время просмотра', value: '4:32' },
{ label: 'Показатель отказов (3D)', value: '18%' },
{ label: 'Показатель отказов (2.5D)', value: '26%' },
{ label: 'FPS стабильность (desktop)', value: '94%' },
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
