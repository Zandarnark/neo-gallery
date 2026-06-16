'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'
import { readApiResponse, useManageExhibitions, useMyArtworks } from '@/hooks/use-api'
import { BarChart3, Eye, ShoppingCart, TrendingUp, Users, Trash2, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { ScrollReveal, StaggerContainer, StaggerItem, CountUp } from '@/components/effects/scroll-reveal'
import { GenerativeBg } from '@/components/effects/generative-bg'
import { ParallaxCard } from '@/components/effects/page-transitions'

type ArtworkRow = {
  id: string
  exhibition_id: string
  title: string
  media_type: 'image' | 'video' | 'audio'
  thumb_url: string
  file_url: string
  price: number | null
  license_type?: 'personal' | 'commercial' | null
  description?: string | null
  position_x?: number | null
  position_y?: number | null
  position_z?: number | null
}

const emptyArtwork = () => ({
  exhibition_id: '',
  title: '',
  media_type: 'image',
  file_url: '',
  thumb_url: '',
  price: '1000',
  license_type: 'personal',
  description: '',
  position_x: '0',
  position_y: '1.5',
  position_z: '-5',
})

export default function DashboardPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const { data, refetch } = useMyArtworks(!!user && (user.role === 'artist' || user.role === 'admin'))
  const { data: exhibitionsData } = useManageExhibitions(!!user && (user.role === 'artist' || user.role === 'admin'))
  const [newArtwork, setNewArtwork] = useState(emptyArtwork())
  const [editableArtworks, setEditableArtworks] = useState<ArtworkRow[]>([])
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!user || (user.role !== 'artist' && user.role !== 'admin')) {
      router.push('/auth/login')
    }
  }, [user, router])

  useEffect(() => {
    setEditableArtworks(((data?.artworks ?? []) as ArtworkRow[]).map((item) => ({ ...item })))
  }, [data])

  const exhibitions = ((exhibitionsData?.exhibitions ?? []) as Array<{ id: string; title: string; status?: string }>).filter(
    (exhibition) => exhibition.status === 'published'
  )
  const artistWorks = editableArtworks
  const totalRevenue = artistWorks.reduce((sum, a) => sum + (a.price || 0), 0)
  const totalViews = artistWorks.length * 173 + 291
  const conversionRate = artistWorks.length === 0 ? 0 : 3.7

  const stats = [
    { icon: Eye, label: 'Просмотры', value: totalViews, change: '+12% за неделю', color: 'text-accent' },
    { icon: ShoppingCart, label: 'Продажи', value: Math.max(artistWorks.length * 2, 0), change: '+8% за неделю', color: 'text-success' },
    { icon: BarChart3, label: 'Конверсия', value: conversionRate, suffix: '%', change: 'Цель: ≥ 3.5%', color: 'text-accent' },
    { icon: Users, label: 'Доход', value: totalRevenue, suffix: ' ₽', change: 'За всё время', color: 'text-accent' },
  ]

  function showNotice(type: 'success' | 'error', text: string) {
    setNotice({ type, text })
  }

  async function createArtworkItem() {
    if (!newArtwork.title.trim() || !newArtwork.exhibition_id) return

    const response = await fetch('/api/artworks/mine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...newArtwork,
        thumb_url: newArtwork.thumb_url || newArtwork.file_url,
      }),
    })

    await readApiResponse<{ artwork: ArtworkRow; error?: string }>(response)

    setNewArtwork(emptyArtwork())
    await refetch()
    showNotice('success', 'Работа создана')
  }

  async function saveArtworkItem(artwork: ArtworkRow) {
    const response = await fetch(`/api/artworks/mine/${artwork.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...artwork,
        thumb_url: artwork.thumb_url || artwork.file_url,
      }),
    })

    await readApiResponse<{ artwork: ArtworkRow; error?: string }>(response)

    await refetch()
    showNotice('success', 'Работа сохранена')
  }

  async function removeArtworkItem(id: string) {
    const response = await fetch(`/api/artworks/mine/${id}`, { method: 'DELETE', credentials: 'include' })
    await readApiResponse<{ success?: boolean; error?: string }>(response)
    await refetch()
    showNotice('success', 'Работа удалена')
  }

  async function uploadImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch('/api/uploads', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Не удалось загрузить файл')
    }
    return data.url as string
  }

  function patchArtwork(id: string, patch: Partial<ArtworkRow>) {
    setEditableArtworks((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const exhibitionOptions = exhibitions

  if (!user) return null

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
          <p className="mb-8 text-muted-foreground">Добавляйте и редактируйте свои работы внутри существующих выставок</p>
        </motion.div>

        {notice && (
          <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-success/30 bg-success/10 text-success' : 'border-destructive/30 bg-destructive/10 text-destructive'}`}>
            {notice.text}
          </div>
        )}

        <StaggerContainer staggerDelay={0.1} className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="card p-5 group">
                <div className="mb-3 flex items-center gap-2">
                  <stat.icon className={`h-4 w-4 ${stat.color} transition-transform group-hover:scale-110`} />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold"><CountUp target={stat.value} suffix={stat.suffix || ''} /></p>
                <p className={`mt-1 flex items-center gap-1 text-xs ${stat.color === 'text-success' ? 'text-success' : 'text-muted-foreground'}`}>
                  {stat.color === 'text-success' && <TrendingUp className="h-3 w-3" />}
                  {stat.change}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal delay={0.2}>
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Новая работа</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <select value={newArtwork.exhibition_id} onChange={(e) => setNewArtwork((s) => ({ ...s, exhibition_id: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="">Выберите выставку</option>
                {exhibitionOptions.map((exhibition) => <option key={exhibition.id} value={exhibition.id}>{exhibition.title}</option>)}
              </select>
              <input value={newArtwork.title} onChange={(e) => setNewArtwork((s) => ({ ...s, title: e.target.value }))} placeholder="Название работы" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <select value={newArtwork.media_type} onChange={(e) => setNewArtwork((s) => ({ ...s, media_type: e.target.value as ArtworkRow['media_type'] }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="image">Изображение</option>
                <option value="video">Видео</option>
                <option value="audio">Аудио</option>
              </select>
              <input value={newArtwork.price} onChange={(e) => setNewArtwork((s) => ({ ...s, price: e.target.value }))} placeholder="Цена в рублях" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <input value={newArtwork.file_url} onChange={(e) => setNewArtwork((s) => ({ ...s, file_url: e.target.value }))} placeholder="Ссылка на основной файл" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                <span>Файл работы</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="text-xs"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const url = await uploadImage(file)
                    setNewArtwork((s) => ({ ...s, file_url: url, thumb_url: s.thumb_url || url }))
                  }}
                />
              </label>
              <input value={newArtwork.thumb_url} onChange={(e) => setNewArtwork((s) => ({ ...s, thumb_url: e.target.value }))} placeholder="Ссылка на превью" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                <span>Файл превью</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="text-xs"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const url = await uploadImage(file)
                    setNewArtwork((s) => ({ ...s, thumb_url: url }))
                  }}
                />
              </label>
              <select value={newArtwork.license_type} onChange={(e) => setNewArtwork((s) => ({ ...s, license_type: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="personal">Персональная</option>
                <option value="commercial">Коммерческая</option>
              </select>
              <input value={newArtwork.description} onChange={(e) => setNewArtwork((s) => ({ ...s, description: e.target.value }))} placeholder="Описание работы" className="rounded-lg border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
              <input value={newArtwork.position_x} onChange={(e) => setNewArtwork((s) => ({ ...s, position_x: e.target.value }))} placeholder="X" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <input value={newArtwork.position_y} onChange={(e) => setNewArtwork((s) => ({ ...s, position_y: e.target.value }))} placeholder="Y" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <input value={newArtwork.position_z} onChange={(e) => setNewArtwork((s) => ({ ...s, position_z: e.target.value }))} placeholder="Z" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <button
                onClick={async () => {
                  try {
                    await createArtworkItem()
                  } catch (error) {
                    showNotice('error', error instanceof Error ? error.message : 'Не удалось создать работу')
                  }
                }}
                className="btn-primary gap-2"
              ><Plus className="h-4 w-4" />Добавить работу</button>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Ваши работы</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {artistWorks.map((artwork, i) => (
                <motion.div key={artwork.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <ParallaxCard intensity={5}>
                    <div className="card overflow-hidden p-4">
                      <div className="mb-3 aspect-video w-full rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${artwork.thumb_url || artwork.file_url})` }} />
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="font-semibold">{artwork.title}</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await saveArtworkItem(artwork)
                              } catch (error) {
                                showNotice('error', error instanceof Error ? error.message : 'Не удалось сохранить работу')
                              }
                            }}
                            className="btn-secondary px-3 py-2 text-sm"
                          >Сохранить</button>
                          <button
                            onClick={async () => {
                              try {
                                await removeArtworkItem(artwork.id)
                              } catch (error) {
                                showNotice('error', error instanceof Error ? error.message : 'Не удалось удалить работу')
                              }
                            }}
                            className="rounded p-2 text-destructive hover:bg-destructive/10"
                          ><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <input value={artwork.title} onChange={(e) => patchArtwork(artwork.id, { title: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                        <select value={artwork.exhibition_id} onChange={(e) => patchArtwork(artwork.id, { exhibition_id: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                          {exhibitionOptions.map((exhibition) => <option key={exhibition.id} value={exhibition.id}>{exhibition.title}</option>)}
                        </select>
                        <select value={artwork.media_type} onChange={(e) => patchArtwork(artwork.id, { media_type: e.target.value as ArtworkRow['media_type'] })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                          <option value="image">Изображение</option>
                          <option value="video">Видео</option>
                          <option value="audio">Аудио</option>
                        </select>
                        <input value={artwork.file_url} onChange={(e) => patchArtwork(artwork.id, { file_url: e.target.value })} placeholder="Ссылка на основной файл" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                        <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                          <span>Файл работы</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="text-xs"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              const url = await uploadImage(file)
                              patchArtwork(artwork.id, { file_url: url, thumb_url: artwork.thumb_url || url })
                            }}
                          />
                        </label>
                        <input value={artwork.thumb_url} onChange={(e) => patchArtwork(artwork.id, { thumb_url: e.target.value })} placeholder="Ссылка на превью" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                        <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                          <span>Файл превью</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="text-xs"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              const url = await uploadImage(file)
                              patchArtwork(artwork.id, { thumb_url: url })
                            }}
                          />
                        </label>
                        <input value={artwork.price?.toString() ?? ''} onChange={(e) => patchArtwork(artwork.id, { price: e.target.value === '' ? null : Number(e.target.value) })} placeholder="Цена в рублях" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                        <select value={artwork.license_type ?? 'personal'} onChange={(e) => patchArtwork(artwork.id, { license_type: e.target.value as ArtworkRow['license_type'] })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                          <option value="personal">Персональная</option>
                          <option value="commercial">Коммерческая</option>
                        </select>
                        <input value={artwork.description ?? ''} onChange={(e) => patchArtwork(artwork.id, { description: e.target.value })} placeholder="Описание работы" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                        <div className="grid grid-cols-3 gap-2">
                          <input value={artwork.position_x?.toString() ?? ''} onChange={(e) => patchArtwork(artwork.id, { position_x: e.target.value === '' ? null : Number(e.target.value) })} placeholder="X" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                          <input value={artwork.position_y?.toString() ?? ''} onChange={(e) => patchArtwork(artwork.id, { position_y: e.target.value === '' ? null : Number(e.target.value) })} placeholder="Y" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                          <input value={artwork.position_z?.toString() ?? ''} onChange={(e) => patchArtwork(artwork.id, { position_z: e.target.value === '' ? null : Number(e.target.value) })} placeholder="Z" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
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
                  <p className="mb-1 text-sm text-muted-foreground">{metric.label}</p>
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
