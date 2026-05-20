import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return
  }

  const content = fs.readFileSync(filePath, 'utf8')

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) {
      continue
    }

    const separatorIndex = line.indexOf('=')
    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

const __filename = fileURLToPath(import.meta.url)
const rootDir = path.resolve(path.dirname(__filename), '..')
loadEnvFile(path.join(rootDir, '.env.local'))

function env(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const supabase = createClient(env('NEXT_PUBLIC_SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const now = new Date().toISOString()

function id(prefix, value) {
  return `${prefix}_${value}`
}

const users = [
  {
    id: id('usr', 'admin'),
    email: env('ADMIN_EMAIL').trim().toLowerCase(),
    password_hash: bcrypt.hashSync(env('ADMIN_PASSWORD'), 10),
    role: 'admin',
    avatar_url: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: id('usr', 'visitor'),
    email: 'visitor@neo-gallery.local',
    password_hash: bcrypt.hashSync('visitor123', 10),
    role: 'visitor',
    avatar_url: null,
    created_at: now,
    updated_at: now,
  },
  {
    id: id('usr', 'artist'),
    email: 'artist@neo-gallery.local',
    password_hash: bcrypt.hashSync('artist123', 10),
    role: 'artist',
    avatar_url: null,
    created_at: now,
    updated_at: now,
  },
]

const exhibitions = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    title: 'Свет и Тень',
    slug: 'svet-i-ten',
    status: 'published',
    start_date: '2024-03-01',
    end_date: '2024-06-30',
    cover_url: '/covers/svet-i-ten.png',
    description: 'Исследование цифрового света в виртуальном пространстве',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    title: 'Генезис Форм',
    slug: 'genezis-form',
    status: 'published',
    start_date: '2024-04-15',
    end_date: '2024-08-15',
    cover_url: '/covers/genezis-form.png',
    description: 'Генеративное искусство и эволюция формы',
    created_at: now,
    updated_at: now,
  },
]

const artworks = [
  {
    id: '1',
    exhibition_id: 'b0000000-0000-0000-0000-000000000001',
    artist_id: id('usr', 'artist'),
    title: 'Луч сквозь тьму',
    media_type: 'image',
    file_url: '/artworks/ray.png',
    thumb_url: '/artworks/ray.png',
    price: 1500,
    license_type: 'personal',
    polygon_count: null,
    lod_levels: null,
    description: 'Медитативная работа о поиске света в цифровом мраке',
    position_x: -3,
    position_y: 1.5,
    position_z: -5,
    created_at: now,
    updated_at: now,
  },
  {
    id: '2',
    exhibition_id: 'b0000000-0000-0000-0000-000000000001',
    artist_id: id('usr', 'artist'),
    title: 'Преломление',
    media_type: 'image',
    file_url: '/artworks/refraction.png',
    thumb_url: '/artworks/refraction.png',
    price: 3500,
    license_type: 'commercial',
    polygon_count: null,
    lod_levels: null,
    description: 'Цифровая работа, исследующая преломление света и стеклянные отражения',
    position_x: 0,
    position_y: 0,
    position_z: -8,
    created_at: now,
    updated_at: now,
  },
  {
    id: '3',
    exhibition_id: 'b0000000-0000-0000-0000-000000000002',
    artist_id: id('usr', 'artist'),
    title: 'Алгоритм роста',
    media_type: 'video',
    file_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjZqbXV1NXVxOG91aGpqdTJ5b3BwdWJ0dTJnZXltcGRqZGp1bmVjNSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7TKtnuHOHHUjR38Y/giphy.gif',
    thumb_url: '/artworks/growth.png',
    price: 5000,
    license_type: 'commercial',
    polygon_count: null,
    lod_levels: null,
    description: 'GIF-видеоарт о росте органических форм и генеративном движении',
    position_x: 0,
    position_y: 0,
    position_z: -10,
    created_at: now,
    updated_at: now,
  },
]

const tickets = [
  {
    id: 't1',
    exhibition_id: 'b0000000-0000-0000-0000-000000000001',
    type: 'single',
    price: 299,
    max_qty: 500,
    sold_qty: 127,
    perks_json: { access: 'full', guide: true },
    created_at: now,
    updated_at: now,
  },
  {
    id: 't2',
    exhibition_id: 'b0000000-0000-0000-0000-000000000001',
    type: 'season',
    price: 999,
    max_qty: 100,
    sold_qty: 34,
    perks_json: { access: 'full', guide: true, merch_discount: 10, early_access: true },
    created_at: now,
    updated_at: now,
  },
  {
    id: 't3',
    exhibition_id: 'b0000000-0000-0000-0000-000000000002',
    type: 'single',
    price: 199,
    max_qty: 300,
    sold_qty: 89,
    perks_json: { access: 'full', guide: true },
    created_at: now,
    updated_at: now,
  },
]

async function upsert(table, rows, onConflict) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict })
  if (error) {
    throw error
  }
}

async function main() {
  await upsert('users', users, 'email')
  await upsert('exhibitions', exhibitions, 'id')
  await upsert('artworks', artworks, 'id')
  await upsert('tickets', tickets, 'id')

  console.log('Seed complete')
  console.log(`Admin: ${env('ADMIN_EMAIL')}`)
  console.log('Demo visitor: visitor@neo-gallery.local / visitor123')
  console.log('Demo artist: artist@neo-gallery.local / artist123')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
