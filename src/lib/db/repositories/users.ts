import bcrypt from 'bcryptjs'
import { createId, getSupabaseAdmin, nowIso } from '@/lib/db/client'
import type { PublicUser, UserRecord, UserRole } from '@/lib/db/types'
import type { Database } from '@/lib/supabase/types'

function mapPublicUser(user: Pick<UserRecord, 'id' | 'email' | 'role' | 'avatar_url'>): PublicUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatar_url,
  }
}

export async function listUsers() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('users')
    .select('id, email, role, avatar_url, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) throw error

  const rows = (data ?? []) as Array<Omit<UserRecord, 'password_hash'>>

  return rows.map((row) => ({
    ...mapPublicUser(row as UserRecord),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function findUserById(id: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle()

  if (error) throw error
  return (data as UserRecord | null) ?? undefined
}

export async function findUserByEmail(email: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle()

  if (error) throw error
  return (data as UserRecord | null) ?? undefined
}

export async function findUserByRole(role: UserRole) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', role)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return (data as UserRecord | null) ?? undefined
}

export async function createUser(email: string, password: string) {
  const supabase = getSupabaseAdmin()
  const now = nowIso()
  const normalizedEmail = email.trim().toLowerCase()
  const user: Database['public']['Tables']['users']['Insert'] = {
    id: createId('usr'),
    email: normalizedEmail,
    password_hash: bcrypt.hashSync(password, 10),
    role: 'visitor',
    avatar_url: null,
    created_at: now,
    updated_at: now,
  }

  const { error } = await supabase.from('users' as never).insert(user as never)
  if (error) throw error

  return mapPublicUser(user as UserRecord)
}

export async function createUserWithRole(email: string, password: string, role: UserRole) {
  const supabase = getSupabaseAdmin()
  const now = nowIso()
  const normalizedEmail = email.trim().toLowerCase()
  const user: Database['public']['Tables']['users']['Insert'] = {
    id: createId('usr'),
    email: normalizedEmail,
    password_hash: bcrypt.hashSync(password, 10),
    role,
    avatar_url: null,
    created_at: now,
    updated_at: now,
  }

  const { error } = await supabase.from('users' as never).insert(user as never)
  if (error) throw error

  return mapPublicUser(user as UserRecord)
}

export async function verifyUserCredentials(email: string, password: string) {
  const user = await findUserByEmail(email)

  if (!user) {
    return null
  }

  if (!bcrypt.compareSync(password, user.password_hash)) {
    return null
  }

  return mapPublicUser(user)
}

export async function updateUserRole(id: string, role: UserRole) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('users' as never)
    .update({ role, updated_at: nowIso() } as never)
    .eq('id', id)

  if (error) throw error
  return findUserById(id)
}

export async function deleteUser(id: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('users').delete().eq('id', id)
  if (error) throw error
}

export function toPublicUser(user: UserRecord | null | undefined) {
  return user ? mapPublicUser(user) : null
}
