export const mockExhibitions = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    title: 'Свет и Тень',
    slug: 'svet-i-ten',
    status: 'published' as const,
    start_date: '2024-03-01',
    end_date: '2024-06-30',
    cover_url: '/covers/svet-i-ten.png',
    description: 'Исследование цифрового света в виртуальном пространстве',
    created_at: '2024-02-15',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    title: 'Генезис Форм',
    slug: 'genezis-form',
    status: 'published' as const,
    start_date: '2024-04-15',
    end_date: '2024-08-15',
    cover_url: '/covers/genezis-form.png',
    description: 'Генеративное искусство и эволюция формы',
    created_at: '2024-03-20',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    title: 'Незавершённое',
    slug: 'nezavershennoe',
    status: 'draft' as const,
    start_date: '2024-06-01',
    end_date: null,
    cover_url: '/covers/nezavershennoe.png',
    description: 'Работа в процессе — выставка в разработке',
    created_at: '2024-05-01',
  },
]

export const mockArtworks = [
  {
    id: '1',
    exhibition_id: 'b0000000-0000-0000-0000-000000000001',
    artist_id: 'a1',
    title: 'Луч сквозь тьму',
    media_type: 'image' as const,
    file_url: '/artworks/ray.png',
    thumb_url: '/artworks/ray.png',
    price: 1500,
    license_type: 'personal' as const,
    polygon_count: null,
    lod_levels: null,
    description: 'Медитативная работа о поиске света в цифровом мраке',
    position_x: -3,
    position_y: 1.5,
    position_z: -5,
    artist: { bio: 'Цифровой скульптор', tier: 'pro', user_id: 'a1' },
  },
  {
    id: '2',
    exhibition_id: 'b0000000-0000-0000-0000-000000000001',
    artist_id: 'a2',
    title: 'Преломление',
    media_type: 'image' as const,
    file_url: '/artworks/refraction.png',
    thumb_url: '/artworks/refraction.png',
    price: 3500,
    license_type: 'commercial' as const,
    polygon_count: null,
    lod_levels: null,
    description: 'Цифровая работа, исследующая преломление света и стеклянные отражения',
    position_x: 0,
    position_y: 0,
    position_z: -8,
    artist: { bio: 'Генеративный художник', tier: 'premium', user_id: 'a2' },
  },
  {
    id: '3',
    exhibition_id: 'b0000000-0000-0000-0000-000000000001',
    artist_id: 'a2',
    title: 'Пульсация',
    media_type: 'video' as const,
    file_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTBkd3dxNXp1Mjd3ZzY0N2swM2Rhd2ZrdHB1eTBxN2t6b3l5cGY1YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xTiTnxpQ3ghPiB2Hp6/giphy.gif',
    thumb_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTBkd3dxNXp1Mjd3ZzY0N2swM2Rhd2ZrdHB1eTBxN2t6b3l5cGY1YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xTiTnxpQ3ghPiB2Hp6/giphy.gif',
    price: 2000,
    license_type: 'personal' as const,
    polygon_count: null,
    lod_levels: null,
    description: 'GIF-видеоарт: ритм, пульсация и цифровое движение городской среды',
    position_x: 3,
    position_y: 1.5,
    position_z: -5,
    artist: { bio: 'Генеративный художник', tier: 'premium', user_id: 'a2' },
  },
  {
    id: '4',
    exhibition_id: 'b0000000-0000-0000-0000-000000000002',
    artist_id: 'a2',
    title: 'Алгоритм роста',
    media_type: 'video' as const,
    file_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjZqbXV1NXVxOG91aGpqdTJ5b3BwdWJ0dTJnZXltcGRqZGp1bmVjNSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7TKtnuHOHHUjR38Y/giphy.gif',
    thumb_url: '/artworks/growth.png',
    price: 5000,
    license_type: 'commercial' as const,
    polygon_count: null,
    lod_levels: null,
    description: 'GIF-видеоарт о росте органических форм и генеративном движении',
    position_x: 0,
    position_y: 0,
    position_z: -10,
    artist: { bio: 'Генеративный художник', tier: 'premium', user_id: 'a2' },
  },
  {
    id: '5',
    exhibition_id: 'b0000000-0000-0000-0000-000000000002',
    artist_id: 'a1',
    title: 'Эрозия',
    media_type: 'image' as const,
    file_url: '/artworks/erosion.png',
    thumb_url: '/artworks/erosion.png',
    price: 800,
    license_type: 'personal' as const,
    polygon_count: null,
    lod_levels: null,
    description: 'Цифровая эрозия: распад и обновление пикселей',
    position_x: -4,
    position_y: 1.5,
    position_z: -10,
    artist: { bio: 'Цифровой скульптор', tier: 'pro', user_id: 'a1' },
  },
  {
    id: '6',
    exhibition_id: 'b0000000-0000-0000-0000-000000000002',
    artist_id: 'a2',
    title: 'Фрактальный дождь',
    media_type: 'audio' as const,
    file_url: '/audio/fractal.mp3',
    thumb_url: '/artworks/fractal.png',
    price: 1200,
    license_type: 'personal' as const,
    polygon_count: null,
    lod_levels: null,
    description: 'Звуковая инсталляция: фрактальные алгоритмы в аудио-пространстве',
    position_x: 4,
    position_y: 1.5,
    position_z: -10,
    artist: { bio: 'Генеративный художник', tier: 'premium', user_id: 'a2' },
  },
]

export const mockTickets = [
  {
    id: 't1',
    exhibition_id: 'b0000000-0000-0000-0000-000000000001',
    type: 'single' as const,
    price: 299,
    max_qty: 500,
    sold_qty: 127,
    perks_json: { access: 'full', guide: true },
  },
  {
    id: 't2',
    exhibition_id: 'b0000000-0000-0000-0000-000000000001',
    type: 'season' as const,
    price: 999,
    max_qty: 100,
    sold_qty: 34,
    perks_json: { access: 'full', guide: true, merch_discount: 10, early_access: true },
  },
  {
    id: 't3',
    exhibition_id: 'b0000000-0000-0000-0000-000000000002',
    type: 'single' as const,
    price: 199,
    max_qty: 300,
    sold_qty: 89,
    perks_json: { access: 'full', guide: true },
  },
  {
    id: 't4',
    exhibition_id: 'b0000000-0000-0000-0000-000000000002',
    type: 'season' as const,
    price: 799,
    max_qty: 50,
    sold_qty: 12,
    perks_json: { access: 'full', guide: true, merch_discount: 15 },
  },
]

export interface MockOrderItem {
  id: string
  type: 'ticket' | 'merch' | 'license' | 'subscription'
  ref_id: string
  qty: number
  price: number
}

export interface MockOrder {
  id: string
  user_id: string
  status: 'pending' | 'paid' | 'fulfilled' | 'refunded' | 'expired' | 'canceled' | 'failed'
  total: number
  currency: string
  payment_id: string
  created_at: string
  order_items: MockOrderItem[]
}

export const mockOrders: MockOrder[] = [
  {
    id: 'o1',
    user_id: 'u1',
    status: 'paid',
    total: 299,
    currency: 'RUB',
    payment_id: 'mock-pay-001',
    created_at: '2024-03-10T14:30:00Z',
    order_items: [
      { id: 'oi1', type: 'ticket', ref_id: 't1', qty: 1, price: 299 },
    ],
  },
  {
    id: 'o2',
    user_id: 'u1',
    status: 'paid',
    total: 1500,
    currency: 'RUB',
    payment_id: 'mock-pay-002',
    created_at: '2024-03-15T10:00:00Z',
    order_items: [
      { id: 'oi2', type: 'license', ref_id: '1', qty: 1, price: 1500 },
    ],
  },
]
