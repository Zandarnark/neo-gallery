'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { mockExhibitions } from '@/lib/mock-data'
import { ArrowDown, ArrowRight, Sparkles, Monitor, Smartphone } from 'lucide-react'
import { ScrollReveal, StaggerContainer, StaggerItem, CountUp } from '@/components/effects/scroll-reveal'
import { Magnetic } from '@/components/effects/magnetic'
import { ParallaxCard, GlitchText, SectionDivider } from '@/components/effects/page-transitions'
import { motion } from 'framer-motion'
import gsap from 'gsap'

export default function HomePage() {
const published = mockExhibitions.filter((e) => e.status === 'published')
const heroRef = useRef<HTMLDivElement>(null)
const titleRef = useRef<HTMLHeadingElement>(null)

useEffect(() => {
if (!heroRef.current || !titleRef.current) return

const ctx = gsap.context(() => {
gsap.from(titleRef.current!.querySelectorAll('.hero-word'), {
y: 80,
opacity: 0,
rotationX: -40,
duration: 1.2,
stagger: 0.08,
ease: 'power4.out',
delay: 0.3,
})

gsap.from('.hero-subtitle', {
y: 30,
opacity: 0,
duration: 1,
ease: 'power3.out',
delay: 0.9,
})

gsap.from('.hero-cta', {
y: 20,
opacity: 0,
duration: 0.8,
stagger: 0.15,
ease: 'power3.out',
delay: 1.2,
})

gsap.from('.hero-orb', {
scale: 0,
opacity: 0,
duration: 2,
stagger: 0.3,
ease: 'power2.out',
delay: 0.2,
})
}, heroRef)

return () => ctx.revert()
}, [])

const titleWords = ['Цифровое', 'искусство']
const subtitleWords = ['в виртуальном пространстве']

return (
<div className="flex flex-col">
<section
ref={heroRef}
className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 text-center"
>
<div className="hero-orb absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-accent/20 blur-[100px] animate-drift" />
<div className="hero-orb absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-accent/10 blur-[120px] animate-drift" style={{ animationDelay: '3s' }} />
<div className="hero-orb absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-accent/15 blur-[80px] animate-float" />

<div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%237c5bf5\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

<div className="relative z-10 max-w-4xl">
<h1 ref={titleRef} className="mb-6 perspective-[800px]" style={{ perspective: '800px' }}>
<div className="overflow-hidden">
{titleWords.map((word, i) => (
<span
key={i}
className="hero-word inline-block mr-4 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
style={{ display: 'inline-block' }}
>
{i === 1 ? (
<span className="text-gradient-shimmer">{word}</span>
) : (
<span className="text-foreground">{word}</span>
)}
</span>
))}
</div>
<div className="overflow-hidden mt-2">
{subtitleWords.map((word, i) => (
<span
key={`sub-${i}`}
className="hero-word inline-block text-4xl font-bold tracking-tight text-accent sm:text-6xl lg:text-7xl"
style={{ display: 'inline-block' }}
>
{word}
</span>
))}
</div>
</h1>

<p className="hero-subtitle mx-auto mb-10 max-w-xl text-lg text-muted-foreground opacity-0">
Иммерсивные 3D-выставки с кинематографической навигацией, адаптивные
для любого устройства
</p>

<div className="flex flex-wrap items-center justify-center gap-4">
<Magnetic strength={0.15}>
<Link
href="/exhibitions"
className="hero-cta btn-primary gap-2 px-8 py-3 text-base opacity-0"
>
<Sparkles className="h-5 w-5" />
Посмотреть выставки
</Link>
</Magnetic>
<Magnetic strength={0.15}>
<Link
href="#features"
className="hero-cta btn-secondary gap-2 px-8 py-3 text-base opacity-0"
>
Узнать больше
<ArrowRight className="h-4 w-4" />
</Link>
</Magnetic>
</div>
</div>

<div className="absolute bottom-8 left-1/2 -translate-x-1/2">
<motion.div
animate={{ y: [0, 8, 0] }}
transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-background/50 text-accent/70 backdrop-blur"
aria-label="Прокрутить вниз"
>
<ArrowDown className="h-6 w-6" />
</motion.div>
</div>
</section>

<SectionDivider />

<section id="features" className="bg-muted/20 px-4 py-24">
<div className="mx-auto max-w-5xl">
<ScrollReveal>
<h2 className="mb-16 text-center text-3xl font-bold sm:text-4xl">
Как это <GlitchText text="работает" />
</h2>
</ScrollReveal>

<StaggerContainer staggerDelay={0.15} className="grid items-stretch gap-8 sm:grid-cols-3">
<StaggerItem className="h-full">
<ParallaxCard intensity={6} className="h-full">
<div className="card group flex h-full min-h-[260px] flex-col p-8 text-center">
<div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 transition-colors group-hover:bg-accent/20">
<Monitor className="h-7 w-7 text-accent transition-transform group-hover:scale-110" />
</div>
<h3 className="mb-3 text-lg font-semibold">3D-навигация</h3>
<p className="text-sm leading-relaxed text-muted-foreground">
Исследуйте выставки в иммерсивном 3D-пространстве с WASD-управлением
и хотспотами
</p>
</div>
</ParallaxCard>
</StaggerItem>

<StaggerItem className="h-full">
<ParallaxCard intensity={6} className="h-full">
<div className="card group flex h-full min-h-[260px] flex-col p-8 text-center">
<div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 transition-colors group-hover:bg-accent/20">
<Smartphone className="h-7 w-7 text-accent transition-transform group-hover:scale-110" />
</div>
<h3 className="mb-3 text-lg font-semibold">Адаптивность</h3>
<p className="text-sm leading-relaxed text-muted-foreground">
Автоматический переход на 2.5D-галерею для мобильных и слабых
устройств
</p>
</div>
</ParallaxCard>
</StaggerItem>

<StaggerItem className="h-full">
<ParallaxCard intensity={6} className="h-full">
<div className="card group flex h-full min-h-[260px] flex-col p-8 text-center">
<div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 transition-colors group-hover:bg-accent/20">
<Sparkles className="h-7 w-7 text-accent transition-transform group-hover:scale-110" />
</div>
<h3 className="mb-3 text-lg font-semibold">Монетизация</h3>
<p className="text-sm leading-relaxed text-muted-foreground">
Билеты, лицензии на арты, мерч и подписки для авторов
</p>
</div>
</ParallaxCard>
</StaggerItem>
</StaggerContainer>
</div>
</section>

<SectionDivider />

<section className="px-4 py-24">
<div className="mx-auto max-w-5xl">
<ScrollReveal>
<h2 className="mb-16 text-center text-3xl font-bold sm:text-4xl">
Текущие выставки
</h2>
</ScrollReveal>

<StaggerContainer staggerDelay={0.2} className="grid gap-8 sm:grid-cols-2">
{published.map((exhibition) => (
<StaggerItem key={exhibition.id}>
<ParallaxCard intensity={8}>
<Link
href={`/exhibitions/${exhibition.slug}`}
className="card group relative block aspect-[16/10] overflow-hidden"
>
<div
className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
style={{ backgroundImage: `url(${exhibition.cover_url})` }}
/>
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:opacity-90" />
<div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(circle at center, var(--accent) 0%, transparent 70%)', opacity: 0.08 }} />
<div className="absolute bottom-0 left-0 right-0 p-6 transition-transform duration-500 group-hover:translate-y-[-4px]">
<h3 className="mb-1 text-xl font-bold text-white">
{exhibition.title}
</h3>
<p className="text-sm text-white/70">
{exhibition.description}
</p>
<div className="mt-3 flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
<span>Исследовать</span>
<ArrowRight className="h-3 w-3" />
</div>
</div>
</Link>
</ParallaxCard>
</StaggerItem>
))}
</StaggerContainer>
</div>
</section>

<SectionDivider />

<section className="bg-muted/20 px-4 py-24">
<div className="mx-auto max-w-4xl text-center">
<ScrollReveal>
<h2 className="mb-6 text-3xl font-bold sm:text-4xl">
Цифры, которые <span className="text-gradient">говорят сами за себя</span>
</h2>
</ScrollReveal>
<ScrollReveal delay={0.2}>
<p className="mb-16 text-muted-foreground">
Платформа, созданная для художников и ценителей цифрового искусства
</p>
</ScrollReveal>

<StaggerContainer staggerDelay={0.1} className="grid gap-8 sm:grid-cols-4">
<StaggerItem>
<div className="text-center">
<div className="mb-2 text-4xl font-bold text-accent">
<CountUp target={3} suffix="" />
</div>
<p className="text-sm text-muted-foreground">Выставки</p>
</div>
</StaggerItem>
<StaggerItem>
<div className="text-center">
<div className="mb-2 text-4xl font-bold text-accent">
<CountUp target={6} suffix="" />
</div>
<p className="text-sm text-muted-foreground">Работы</p>
</div>
</StaggerItem>
<StaggerItem>
<div className="text-center">
<div className="mb-2 text-4xl font-bold text-accent">
<CountUp target={2} suffix="" />
</div>
<p className="text-sm text-muted-foreground">Художника</p>
</div>
</StaggerItem>
<StaggerItem>
<div className="text-center">
<div className="mb-2 text-4xl font-bold text-accent">
<CountUp target={98} suffix="%" />
</div>
<p className="text-sm text-muted-foreground">Успешность платежей</p>
</div>
</StaggerItem>
</StaggerContainer>
</div>
</section>
</div>
)
}
