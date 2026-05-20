'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'
import { useAdminArtworks, useAdminExhibitions, useAdminUsers } from '@/hooks/use-api'
import {
  Settings,
  Plus,
  Trash2,
  BarChart3,
  DollarSign,
  Users,
  Image as ImageIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { ScrollReveal, StaggerContainer, StaggerItem, CountUp } from '@/components/effects/scroll-reveal'
import { GenerativeBg } from '@/components/effects/generative-bg'

type UserRow = { id: string; email: string; role: 'visitor' | 'artist' | 'admin' }
type ExhibitionRow = {
  id: string
  title: string
  slug: string
  status: 'published' | 'draft' | 'archived'
  start_date?: string
  end_date?: string | null
  cover_url?: string | null
  description?: string | null
}
type ArtworkRow = {
  id: string
  exhibition_id: string
  artist_id?: string | null
  title: string
  media_type?: 'image' | 'video' | 'audio'
  file_url?: string
  thumb_url?: string
  price: number | null
  license_type?: 'personal' | 'commercial' | null
  description?: string | null
  position_x?: number | null
  position_y?: number | null
  position_z?: number | null
}

const emptyExhibition = () => ({
  title: '',
  slug: '',
  status: 'published',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: '',
  cover_url: '',
  description: '',
})

const emptyArtwork = () => ({
  exhibition_id: '',
  artist_id: '',
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

export default function AdminPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const { data: usersData, refetch: refetchUsers } = useAdminUsers()
  const { data: exhibitionsData, refetch: refetchExhibitions } = useAdminExhibitions()
  const { data: artworksData, refetch: refetchArtworks } = useAdminArtworks()
  const [newExhibition, setNewExhibition] = useState(emptyExhibition())
  const [newArtwork, setNewArtwork] = useState(emptyArtwork())
  const [editableExhibitions, setEditableExhibitions] = useState<ExhibitionRow[]>([])
  const [editableArtworks, setEditableArtworks] = useState<ArtworkRow[]>([])
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function showNotice(type: 'success' | 'error', text: string) {
    setNotice({ type, text })
    window.clearTimeout((showNotice as unknown as { timer?: number }).timer)
    ;(showNotice as unknown as { timer?: number }).timer = window.setTimeout(() => {
      setNotice(null)
    }, 3500)
  }

  async function fetchJson(url: string, init?: RequestInit) {
    const response = await fetch(url, init)
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || 'Операция не выполнена')
    }

    return data
  }

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/auth/login')
    }
  }, [user, router])

  useEffect(() => {
    setEditableExhibitions(((exhibitionsData?.exhibitions ?? []) as ExhibitionRow[]).map((item) => ({ ...item })))
  }, [exhibitionsData])

  useEffect(() => {
    setEditableArtworks(((artworksData?.artworks ?? []) as ArtworkRow[]).map((item) => ({ ...item })))
  }, [artworksData])

  const users = (usersData?.users ?? []) as UserRow[]
  const publishedExhibitions = editableExhibitions.filter((e) => e.status === 'published')
  const totalRevenue = editableArtworks.reduce((sum, artwork) => sum + (artwork.price ?? 0), 0)

  const adminStats = [
    { icon: ImageIcon, label: 'Выставки', value: editableExhibitions.length, sub: `Активных: ${publishedExhibitions.length}` },
    { icon: Settings, label: 'Работы', value: editableArtworks.length, sub: 'Всего в системе' },
    { icon: DollarSign, label: 'Доход', value: totalRevenue, suffix: ' ₽', sub: 'За всё время' },
    { icon: Users, label: 'Пользователи', value: users.length, sub: 'Зарегистрированных' },
  ]

  async function changeRole(id: string, role: UserRow['role']) {
    await fetchJson(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role }),
    })
    await refetchUsers()
    showNotice('success', 'Роль пользователя обновлена')
  }

  async function removeUser(id: string) {
    await fetchJson(`/api/admin/users/${id}`, { method: 'DELETE', credentials: 'include' })
    await refetchUsers()
    showNotice('success', 'Пользователь удален')
  }

  async function createExhibitionItem() {
    if (!newExhibition.title.trim()) return

    const slug = (newExhibition.slug || newExhibition.title)
      .trim()
      .toLowerCase()
      .replace(/[^a-zа-я0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')

    await fetchJson('/api/admin/exhibitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...newExhibition,
        slug,
        end_date: newExhibition.end_date || null,
        cover_url: newExhibition.cover_url || null,
        description: newExhibition.description || null,
      }),
    })

    setNewExhibition(emptyExhibition())
    await refetchExhibitions()
    showNotice('success', 'Выставка создана, опубликована и добавлена в список ниже')
  }

  async function saveExhibitionItem(exhibition: ExhibitionRow) {
    await fetchJson(`/api/admin/exhibitions/${exhibition.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...exhibition,
        end_date: exhibition.end_date || null,
        cover_url: exhibition.cover_url || null,
        description: exhibition.description || null,
      }),
    })
    await refetchExhibitions()
    showNotice('success', 'Выставка сохранена')
  }

  async function removeExhibitionItem(id: string) {
    await fetchJson(`/api/admin/exhibitions/${id}`, { method: 'DELETE', credentials: 'include' })
    await refetchExhibitions()
    await refetchArtworks()
    showNotice('success', 'Выставка удалена')
  }

  async function createArtworkItem() {
    if (!newArtwork.title.trim() || !newArtwork.exhibition_id) return
    if (!user) return

    await fetchJson('/api/admin/artworks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...newArtwork,
        artist_id: newArtwork.artist_id || user.id,
        thumb_url: newArtwork.thumb_url || newArtwork.file_url,
      }),
    })

    setNewArtwork(emptyArtwork())
    await refetchArtworks()
    showNotice('success', 'Работа создана')
  }

  async function saveArtworkItem(artwork: ArtworkRow) {
    await fetchJson(`/api/admin/artworks/${artwork.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...artwork,
        thumb_url: artwork.thumb_url || artwork.file_url,
      }),
    })
    await refetchArtworks()
    showNotice('success', 'Работа сохранена')
  }

  async function removeArtworkItem(id: string) {
    await fetchJson(`/api/admin/artworks/${id}`, { method: 'DELETE', credentials: 'include' })
    await refetchArtworks()
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

  function patchExhibition(id: string, patch: Partial<ExhibitionRow>) {
    setEditableExhibitions((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function patchArtwork(id: string, patch: Partial<ArtworkRow>) {
    setEditableArtworks((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const exhibitionOptions = editableExhibitions.map((exhibition) => ({ id: exhibition.id, title: exhibition.title }))

  if (!user) return null

  return (
    <div className="relative px-4 py-12">
      <GenerativeBg />
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">Админ-панель</h1>
          <p className="text-muted-foreground">Управление пользователями, выставками и работами</p>
        </motion.div>

        {notice && (
          <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-success/30 bg-success/10 text-success' : 'border-destructive/30 bg-destructive/10 text-destructive'}`}>
            {notice.text}
          </div>
        )}

        <ScrollReveal delay={0.15}>
          <div className="mb-8 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-4 font-medium text-muted-foreground">Email</th>
                  <th className="p-4 font-medium text-muted-foreground">Роль</th>
                  <th className="p-4 font-medium text-muted-foreground">Управление</th>
                </tr>
              </thead>
              <tbody>
                {users.map((account) => (
                  <tr key={account.id} className="border-b border-border/50">
                    <td className="p-4 font-medium">{account.email}</td>
                    <td className="p-4">{account.role}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {(['visitor', 'artist', 'admin'] as const).map((role) => (
                          <button
                            key={role}
                            onClick={() => changeRole(account.id, role)}
                            className={`rounded-md px-2 py-1 text-xs ${account.role === role ? 'bg-accent text-accent-foreground' : 'bg-muted'}`}
                          >
                            {role}
                          </button>
                        ))}
                        <button
                          onClick={() => removeUser(account.id)}
                          className="rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>

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
                <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal delay={0.2}>
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Новая выставка</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input value={newExhibition.title} onChange={(e) => setNewExhibition((s) => ({ ...s, title: e.target.value }))} placeholder="Название выставки" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <input value={newExhibition.slug} onChange={(e) => setNewExhibition((s) => ({ ...s, slug: e.target.value }))} placeholder="Адрес выставки (slug)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <select value={newExhibition.status} onChange={(e) => setNewExhibition((s) => ({ ...s, status: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="draft">Черновик</option>
                <option value="published">Опубликована</option>
                <option value="archived">Архив</option>
              </select>
              <input value={newExhibition.start_date} onChange={(e) => setNewExhibition((s) => ({ ...s, start_date: e.target.value }))} type="date" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <input value={newExhibition.end_date} onChange={(e) => setNewExhibition((s) => ({ ...s, end_date: e.target.value }))} type="date" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <input value={newExhibition.cover_url} onChange={(e) => setNewExhibition((s) => ({ ...s, cover_url: e.target.value }))} placeholder="Ссылка на обложку" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                <span>Загрузить обложку</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="text-xs"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const url = await uploadImage(file)
                    setNewExhibition((s) => ({ ...s, cover_url: url }))
                  }}
                />
              </label>
              <input value={newExhibition.description} onChange={(e) => setNewExhibition((s) => ({ ...s, description: e.target.value }))} placeholder="Краткое описание выставки" className="rounded-lg border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
              <button onClick={createExhibitionItem} className="btn-primary gap-2"><Plus className="h-4 w-4" />Создать выставку</button>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Выставки</h2>
            <div className="grid gap-4">
              {editableExhibitions.map((exhibition) => (
                <div key={exhibition.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="font-semibold">{exhibition.title || 'Без названия'}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => saveExhibitionItem(exhibition)} className="btn-secondary px-3 py-2 text-sm">Сохранить</button>
                      <button onClick={() => removeExhibitionItem(exhibition.id)} className="rounded p-2 text-destructive hover:bg-destructive/10" aria-label="Удалить">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <input value={exhibition.title} onChange={(e) => patchExhibition(exhibition.id, { title: e.target.value })} placeholder="Название выставки" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                    <input value={exhibition.slug} onChange={(e) => patchExhibition(exhibition.id, { slug: e.target.value })} placeholder="Адрес выставки (slug)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                    <select value={exhibition.status} onChange={(e) => patchExhibition(exhibition.id, { status: e.target.value as ExhibitionRow['status'] })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                      <option value="draft">Черновик</option>
                      <option value="published">Опубликована</option>
                      <option value="archived">Архив</option>
                    </select>
                    <input value={exhibition.start_date ?? ''} onChange={(e) => patchExhibition(exhibition.id, { start_date: e.target.value })} type="date" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                    <input value={exhibition.end_date ?? ''} onChange={(e) => patchExhibition(exhibition.id, { end_date: e.target.value })} type="date" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                    <input value={exhibition.cover_url ?? ''} onChange={(e) => patchExhibition(exhibition.id, { cover_url: e.target.value })} placeholder="Ссылка на обложку" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                    <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                      <span>Файл обложки</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="text-xs"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const url = await uploadImage(file)
                          patchExhibition(exhibition.id, { cover_url: url })
                        }}
                      />
                    </label>
                    <input value={exhibition.description ?? ''} onChange={(e) => patchExhibition(exhibition.id, { description: e.target.value })} placeholder="Краткое описание выставки" className="rounded-lg border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="mb-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Новая работа</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <select value={newArtwork.exhibition_id} onChange={(e) => setNewArtwork((s) => ({ ...s, exhibition_id: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="">Выберите выставку</option>
                {exhibitionOptions.map((exhibition) => <option key={exhibition.id} value={exhibition.id}>{exhibition.title}</option>)}
              </select>
              <input value={newArtwork.artist_id} onChange={(e) => setNewArtwork((s) => ({ ...s, artist_id: e.target.value }))} placeholder="ID автора" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <input value={newArtwork.title} onChange={(e) => setNewArtwork((s) => ({ ...s, title: e.target.value }))} placeholder="Название работы" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <select value={newArtwork.media_type} onChange={(e) => setNewArtwork((s) => ({ ...s, media_type: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="image">Изображение</option>
                <option value="video">Видео</option>
                <option value="audio">Аудио</option>
              </select>
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
              <input value={newArtwork.price} onChange={(e) => setNewArtwork((s) => ({ ...s, price: e.target.value }))} placeholder="Цена в рублях" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <select value={newArtwork.license_type} onChange={(e) => setNewArtwork((s) => ({ ...s, license_type: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="personal">Персональная</option>
                <option value="commercial">Коммерческая</option>
              </select>
              <input value={newArtwork.description} onChange={(e) => setNewArtwork((s) => ({ ...s, description: e.target.value }))} placeholder="Описание работы" className="rounded-lg border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
              <input value={newArtwork.position_x} onChange={(e) => setNewArtwork((s) => ({ ...s, position_x: e.target.value }))} placeholder="X" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <input value={newArtwork.position_y} onChange={(e) => setNewArtwork((s) => ({ ...s, position_y: e.target.value }))} placeholder="Y" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <input value={newArtwork.position_z} onChange={(e) => setNewArtwork((s) => ({ ...s, position_z: e.target.value }))} placeholder="Z" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              <button onClick={createArtworkItem} className="btn-primary">Создать работу</button>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.35}>
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Работы</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {editableArtworks.map((artwork) => (
                <div key={artwork.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="font-medium">{artwork.title || 'Без названия'}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => saveArtworkItem(artwork)} className="btn-secondary px-3 py-2 text-sm">Сохранить</button>
                      <button onClick={() => removeArtworkItem(artwork.id)} className="text-sm text-destructive">Удалить</button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <input value={artwork.title} onChange={(e) => patchArtwork(artwork.id, { title: e.target.value })} placeholder="Название работы" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                    <select value={artwork.exhibition_id} onChange={(e) => patchArtwork(artwork.id, { exhibition_id: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                      {exhibitionOptions.map((exhibition) => <option key={exhibition.id} value={exhibition.id}>{exhibition.title}</option>)}
                    </select>
                    <input value={artwork.artist_id ?? ''} onChange={(e) => patchArtwork(artwork.id, { artist_id: e.target.value })} placeholder="ID автора" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                    <select value={artwork.media_type ?? 'image'} onChange={(e) => patchArtwork(artwork.id, { media_type: e.target.value as ArtworkRow['media_type'] })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                      <option value="image">Изображение</option>
                      <option value="video">Видео</option>
                      <option value="audio">Аудио</option>
                    </select>
                    <input value={artwork.file_url ?? ''} onChange={(e) => patchArtwork(artwork.id, { file_url: e.target.value })} placeholder="Ссылка на основной файл" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
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
                    <input value={artwork.thumb_url ?? ''} onChange={(e) => patchArtwork(artwork.id, { thumb_url: e.target.value })} placeholder="Ссылка на превью" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
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
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
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
