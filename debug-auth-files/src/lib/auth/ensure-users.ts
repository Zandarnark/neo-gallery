import { createUserWithRole, findUserByEmail, findUserByRole } from '@/lib/db/repositories/users'
import type { UserRecord, UserRole } from '@/lib/db/types'

const DEMO_USERS: Record<Exclude<UserRole, 'admin'>, { email: string; password: string }> = {
  visitor: {
    email: 'visitor@neo-gallery.local',
    password: 'visitor123',
  },
  artist: {
    email: 'artist@neo-gallery.local',
    password: 'artist123',
  },
}

export async function ensureAdminUser() {
  const email = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD ?? ''

  if (!email || !password) {
    return null
  }

  const existing = await findUserByEmail(email)
  if (existing) {
    return existing
  }

  await createUserWithRole(email, password, 'admin')
  return findUserByEmail(email)
}

export async function ensureDemoUser(role: Exclude<UserRole, 'admin'>): Promise<UserRecord | undefined> {
  const existing = await findUserByRole(role)
  if (existing) {
    return existing
  }

  const demoUser = DEMO_USERS[role]
  await createUserWithRole(demoUser.email, demoUser.password, role)
  return findUserByRole(role)
}
