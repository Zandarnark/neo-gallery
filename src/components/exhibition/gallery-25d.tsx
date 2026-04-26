'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/stores/ui-store'
import { useAnalytics } from '@/hooks/use-analytics'
import { Eye, Volume2, Video, Box, Image as ImageIcon } from 'lucide-react'

interface ArtworkItem {
id: string
title: string
media_type: string
thumb_url: string
price: number | null
license_type: string | null
artist?: { bio: string; tier: string; user_id: string }
[key: string]: unknown
}

interface Gallery25DProps {
artworks: Record<string, unknown>[]
exhibitionId: string
}

export function Gallery25D({ artworks, exhibitionId }: Gallery25DProps) {
const { openArtworkModal } = useUIStore()
const { log } = useAnalytics()
const [hoveredId, setHoveredId] = useState<string | null>(null)

const typedArtworks = artworks as ArtworkItem[]

const handleArtworkClick = useCallback(
(id: string) => {
openArtworkModal(id)
log('artwork_click', exhibitionId, { artwork_id: id, mode: '2.5d' })
},
[openArtworkModal, log, exhibitionId]
)

const getMediaIcon = (type: string) => {
switch (type) {
case '3d':
return <Box className="h-4 w-4" />
case 'video':
return <Video className="h-4 w-4" />
case 'audio':
return <Volume2 className="h-4 w-4" />
default:
return <ImageIcon className="h-4 w-4" />
}
}

return (
<div className="relative">
<div className="absolute inset-0 overflow-hidden pointer-events-none">
<div className="animate-drift absolute -right-20 top-1/4 h-60 w-60 rounded-full bg-accent/5 blur-[100px]" />
<div className="animate-drift absolute -left-20 bottom-1/3 h-40 w-40 rounded-full bg-accent/8 blur-[80px]" style={{ animationDelay: '4s' }} />
</div>

<div className="relative mx-auto max-w-6xl px-4 py-8">
<div className="mb-6 flex items-center justify-between">
<h2 className="text-xl font-semibold">Работы выставки</h2>
<button
onClick={() => useUIStore.getState().setMode('3d')}
className="btn-secondary text-xs transition-all hover:shadow-[0_0_15px_rgba(124,91,245,0.1)]"
>
Переключить на 3D
</button>
</div>

<div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
{typedArtworks.map((artwork, i) => (
<ArtworkCard
key={artwork.id}
artwork={artwork}
index={i}
hoveredId={hoveredId}
setHoveredId={setHoveredId}
onClick={() => handleArtworkClick(artwork.id)}
getMediaIcon={getMediaIcon}
/>
))}
</div>
</div>
</div>
)
}

function ArtworkCard({
artwork,
index: i,
hoveredId,
setHoveredId,
onClick,
getMediaIcon,
}: {
artwork: ArtworkItem
index: number
hoveredId: string | null
setHoveredId: (id: string | null) => void
onClick: () => void
getMediaIcon: (type: string) => React.ReactNode
}) {
const cardRef = useRef<HTMLDivElement>(null)

const handleMouseMove = (e: React.MouseEvent) => {
const card = cardRef.current
if (!card) return
const rect = card.getBoundingClientRect()
const x = (e.clientX - rect.left) / rect.width - 0.5
const y = (e.clientY - rect.top) / rect.height - 0.5
card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.02)`
card.style.transition = 'transform 0.1s ease-out'
}

const handleMouseLeave = () => {
const card = cardRef.current
if (!card) return
card.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)'
card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
setHoveredId(null)
}

return (
<motion.article
initial={{ opacity: 0, y: 40 }}
animate={{ opacity: 1, y: 0 }}
transition={{
delay: i * 0.1,
duration: 0.6,
ease: [0.16, 1, 0.3, 1],
}}
className="mb-6 break-inside-avoid"
>
<div ref={cardRef} style={{ transformStyle: 'preserve-3d' }}>
<button
onClick={onClick}
onMouseMove={handleMouseMove}
onMouseEnter={() => setHoveredId(artwork.id)}
onMouseLeave={handleMouseLeave}
className="card group relative w-full overflow-hidden text-left"
aria-label={`Открыть работу: ${artwork.title}`}
>
<div className="relative aspect-[4/3] overflow-hidden">
<div
className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
style={{ backgroundImage: `url(${artwork.thumb_url})` }}
role="img"
aria-label={artwork.title}
/>
<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

<div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(circle at center, var(--accent) 0%, transparent 70%)', opacity: 0.06 }} />

<AnimatePresence>
{hoveredId === artwork.id && (
<motion.div
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.9 }}
transition={{ duration: 0.2 }}
className="absolute inset-0 flex items-center justify-center"
>
<div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-md transition-transform group-hover:scale-105">
<Eye className="h-4 w-4 text-white" />
<span className="text-sm font-medium text-white">
Подробнее
</span>
</div>
</motion.div>
)}
</AnimatePresence>

<div className="absolute left-3 top-3">
<span className="flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
{getMediaIcon(artwork.media_type)}
{artwork.media_type === '3d'
? '3D'
: artwork.media_type === 'video'
? 'Видео'
: artwork.media_type === 'audio'
? 'Аудио'
: 'Фото'}
</span>
</div>
</div>

<div className="p-4">
<h3 className="mb-1 font-semibold transition-colors group-hover:text-accent">{artwork.title}</h3>
{artwork.artist?.bio && (
<p className="mb-2 text-xs text-muted-foreground">
{artwork.artist.bio}
</p>
)}
{artwork.price && (
<div className="flex items-center justify-between">
<span className="text-sm font-bold text-accent">
{artwork.price.toLocaleString('ru-RU')} ₽
</span>
{artwork.license_type && (
<span className="text-xs text-muted-foreground">
{artwork.license_type === 'commercial'
? 'Коммерческая'
: 'Персональная'}
</span>
)}
</div>
)}
</div>
</button>
</div>
</motion.article>
)
}
