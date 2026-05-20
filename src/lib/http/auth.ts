import { ApiError } from '@/lib/http/errors'
import { getSessionUser } from '@/lib/auth/session'
import type { PublicUser, UserRole } from '@/lib/db/types'

export async function requireUser() {
  const user = await getSessionUser()

  if (!user) {
    throw new ApiError(401, 'Требуется авторизация')
  }

  return user
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireUser()

  if (!roles.includes(user.role)) {
    throw new ApiError(403, 'Недостаточно прав')
  }

  return user
}

export function assertAdmin(user: PublicUser) {
  if (user.role !== 'admin') {
    throw new ApiError(403, 'Недостаточно прав')
  }
}
