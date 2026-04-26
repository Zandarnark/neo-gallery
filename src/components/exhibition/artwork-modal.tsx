'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/stores/ui-store'
import { useCartStore } from '@/stores/cart-store'
import { mockArtworks } from '@/lib/mock-data'
import {
  X,
  ShoppingCart,
  ZoomIn,
  Box,
  Video,
  Volume2,
  Image as ImageIcon,
  Tag,
} from 'lucide-react'

interface ArtworkModalData {
  id: string
  title: string
  media_type: string
  file_url: string
  thumb_url: string
  price: number | null
  license_type: string | null
  polygon_count: number | null
  lod_levels: number | null
  description: string | null
  artist?: { bio: string; tier: string; user_id: string }
}

export function ArtworkModal() {
  const { artworkModalOpen, selectedArtworkId, closeArtworkModal } =
    useUIStore()
  const { addItem } = useCartStore()
  const [zoomed, setZoomed] = useState(false)

  const artwork = mockArtworks.find((a) => a.id === selectedArtworkId) as
    | ArtworkModalData
    | undefined

  useEffect(() => {
    if (artworkModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [artworkModalOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeArtworkModal()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [closeArtworkModal])

  if (!artwork) return null

  const previewUrl =
    artwork.media_type === 'image'
      ? artwork.file_url || artwork.thumb_url
      : artwork.thumb_url || artwork.file_url

  const getMediaLabel = () => {
    switch (artwork.media_type) {
      case '3d':
        return '3D модель'
      case 'video':
        return 'Видео-арт'
      case 'audio':
        return 'Аудио-инсталляция'
      default:
        return 'Цифровое изображение'
    }
  }

  const getMediaIcon = () => {
    switch (artwork.media_type) {
      case '3d':
        return <Box className="h-5 w-5" />
      case 'video':
        return <Video className="h-5 w-5" />
      case 'audio':
        return <Volume2 className="h-5 w-5" />
      default:
        return <ImageIcon className="h-5 w-5" />
    }
  }

  return (
    <AnimatePresence>
      {artworkModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Работа: ${artwork.title}`}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeArtworkModal}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-card shadow-2xl"
          >
            <button
              onClick={closeArtworkModal}
              className="absolute right-4 top-4 z-20 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid md:grid-cols-2">
              <div className="relative overflow-hidden bg-black">
                <button
                  onClick={() => setZoomed(!zoomed)}
                  className="group relative block h-full min-h-[300px] w-full"
                  aria-label={zoomed ? 'Уменьшить' : 'Увеличить'}
                >
                  <div
                    className={`h-full w-full bg-cover bg-center transition-transform duration-500 ${
                      zoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                    }`}
                    style={{
                      backgroundImage: `url(${previewUrl})`,
                    }}
                    role="img"
                    aria-label={artwork.title}
                  />
                  <div className="absolute bottom-3 right-3 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <ZoomIn className="h-4 w-4" />
                  </div>
                </button>
              </div>

              <div className="flex flex-col gap-4 p-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {getMediaIcon()}
                  <span className="text-sm">{getMediaLabel()}</span>
                </div>

                <h2 className="text-2xl font-bold">{artwork.title}</h2>

                {artwork.artist?.bio && (
                  <p className="text-sm text-muted-foreground">
                    {artwork.artist.bio}
                  </p>
                )}

                {artwork.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {artwork.description}
                  </p>
                )}

                {artwork.polygon_count && (
                  <div className="text-xs text-muted-foreground">
                    Полигоны: {artwork.polygon_count.toLocaleString('ru-RU')} ·
                    LOD: {artwork.lod_levels}
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Лицензия</span>
                  </div>
                  <div className="flex gap-3">
                    {artwork.license_type === 'personal' && (
                      <div className="flex-1 rounded-lg border border-border p-3">
                        <p className="text-sm font-medium">Персональная</p>
                        <p className="text-xs text-muted-foreground">
                          Для личного использования
                        </p>
                      </div>
                    )}
                    {artwork.license_type === 'commercial' && (
                      <>
                        <div className="flex-1 rounded-lg border border-border p-3 opacity-50">
                          <p className="text-sm font-medium">Персональная</p>
                          <p className="text-xs text-muted-foreground">
                            Для личного использования
                          </p>
                        </div>
                        <div className="flex-1 rounded-lg border-2 border-accent p-3">
                          <p className="text-sm font-medium text-accent">
                            Коммерческая
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Для коммерческих проектов
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {artwork.price != null && (
                  <div className="mt-auto border-t border-border pt-4">
                    <div className="mb-3 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-accent">
                        {artwork.price.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        addItem({
                          id: `license-${artwork.id}`,
                          type: 'license',
                          refId: artwork.id,
                          title: artwork.title,
                          price: artwork.price ?? 0,
                          qty: 1,
                          licenseType: artwork.license_type as
                            | 'personal'
                            | 'commercial'
                            | undefined,
                        })
                      }
                      className="btn-primary w-full gap-2 py-3"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Добавить в корзину
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
