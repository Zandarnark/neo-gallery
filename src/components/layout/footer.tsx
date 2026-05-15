import Link from 'next/link'
import { Palette, Heart } from 'lucide-react'

export function Footer() {
return (
<footer className="relative border-t border-border bg-background/50 px-4 py-12">
<div className="absolute inset-0 overflow-hidden">
<div className="absolute bottom-0 left-1/2 h-40 w-96 -translate-x-1/2 rounded-full bg-accent/5 blur-[100px]" />
</div>

<div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8">
<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between w-full">
<Link
href="/"
className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
>
<Palette className="h-5 w-5 text-accent" />
<span className="text-gradient-shimmer">NeoGallery</span>
</Link>

<nav className="flex flex-wrap items-center justify-center gap-6" aria-label="Дополнительная навигация">
<Link
href="/exhibitions"
className="text-sm text-muted-foreground transition-colors hover:text-foreground"
>
Выставки
</Link>
<Link
href="/auth/login"
className="text-sm text-muted-foreground transition-colors hover:text-foreground"
>
Для авторов
</Link>
<a
href="https://web.max.ru/161022481"
target="_blank"
rel="noopener noreferrer"
className="text-sm text-muted-foreground transition-colors hover:text-foreground"
>
Поддержка
</a>
</nav>
</div>

<SectionDividerFooter />

<div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
<p className="flex items-center gap-1 text-sm text-muted-foreground">
Сделано с <Heart className="h-3 w-3 text-accent animate-pulse-glow" /> для цифрового искусства
</p>
<p className="text-xs text-muted-foreground/60">
NeoGallery &copy; {new Date().getFullYear()} — Дипломный проект
</p>
</div>
</div>
</footer>
)
}

function SectionDividerFooter() {
return (
<div className="relative h-px w-full overflow-hidden bg-border">
<div className="absolute inset-0 animate-aurora bg-gradient-to-r from-transparent via-accent/30 to-transparent bg-[length:200%_100%]" />
</div>
)
}
