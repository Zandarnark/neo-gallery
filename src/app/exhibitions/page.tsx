'use client'

import Link from 'next/link'
import { usePublishedExhibitions } from '@/hooks/use-api'
import { Calendar, ArrowRight } from 'lucide-react'
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/effects/scroll-reveal'
import { ParallaxCard, SectionDivider, GlitchText } from '@/components/effects/page-transitions'
import { Magnetic } from '@/components/effects/magnetic'

export default function ExhibitionsPage() {
const { data } = usePublishedExhibitions()
const published = (data ?? []) as Array<{
  id: string
  slug: string
  title: string
  description: string | null
  start_date: string
  end_date: string | null
  cover_url: string | null
  artwork_count?: number
}>

return (
<div className="px-4 py-12">
<div className="mx-auto max-w-6xl">
<ScrollReveal>
<h1 className="mb-2 text-3xl font-bold sm:text-4xl">
<GlitchText text="Выставки" />
</h1>
</ScrollReveal>
<ScrollReveal delay={0.15}>
<p className="mb-10 text-muted-foreground">
Исследуйте виртуальные выставки цифрового искусства
</p>
</ScrollReveal>

<SectionDivider />

<StaggerContainer staggerDelay={0.12} className="mt-10 grid items-stretch gap-8 sm:grid-cols-2 lg:grid-cols-3">
{published.map((exhibition) => {
const artworkCount = exhibition.artwork_count ?? 0

return (
<StaggerItem key={exhibition.id} className="h-full">
<Magnetic strength={0.08} className="h-full">
<ParallaxCard intensity={7} className="h-full">
<Link
href={`/exhibitions/${exhibition.slug}`}
className="card group flex h-full min-h-[410px] flex-col overflow-hidden"
>
<div className="relative aspect-[16/10] overflow-hidden">
<div
className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
style={{ backgroundImage: `url(${exhibition.cover_url})` }}
/>
<div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
<div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(circle at center, var(--accent) 0%, transparent 70%)', opacity: 0.1 }} />
<div className="absolute bottom-3 left-3 flex items-center gap-2">
<span className="badge bg-accent/90 text-accent-foreground backdrop-blur-sm">
{artworkCount} {artworkCount === 1 ? 'работа' : artworkCount < 5 ? 'работы' : 'работ'}
</span>
</div>
</div>
<div className="flex flex-1 flex-col p-5">
<h2 className="mb-1 text-lg font-semibold transition-colors group-hover:text-accent">
{exhibition.title}
</h2>
<p className="mb-3 text-sm text-muted-foreground line-clamp-2">
{exhibition.description}
</p>
<div className="mt-auto flex items-center justify-between gap-3">
<div className="flex items-center gap-1 text-xs text-muted-foreground">
<Calendar className="h-3 w-3" />
{new Date(exhibition.start_date).toLocaleDateString('ru-RU')} —{' '}
{exhibition.end_date
? new Date(exhibition.end_date).toLocaleDateString('ru-RU')
: 'Бессрочно'}
</div>
<span className="flex items-center gap-1 text-xs font-medium text-accent transition-transform group-hover:translate-x-1">
Войти <ArrowRight className="h-3 w-3" />
</span>
</div>
</div>
</Link>
</ParallaxCard>
</Magnetic>
</StaggerItem>
)
})}
</StaggerContainer>
</div>
</div>
)
}
