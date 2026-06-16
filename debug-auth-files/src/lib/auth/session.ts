import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import { initializeDatabase } from '@/lib/db/init'
import { findUserById, toPublicUser } from '@/lib/db/repositories/users'
import type { PublicUser, UserRole } from '@/lib/db/types'

const COOKIE_NAME = 'neo_session'

function getSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('Missing required environment variable: JWT_SECRET')
  }

  return new TextEncoder().encode(secret)
}

export interface SessionPayload {
  sub: string
  email: string
  role: UserRole
}

export async function createSessionToken(user: PublicUser) {
  return new SignJWT({ role: user.role, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifySessionToken(token: string) {
  const result = await jwtVerify(token, getSecret())
  const payload = result.payload as unknown as SessionPayload
  return payload
}

export async function getSessionUser() {
  initializeDatabase()
  const token = cookies().get(COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  try {
    const payload = await verifySessionToken(token)
    return toPublicUser(await findUserById(payload.sub))
  } catch {
    return null
  }
}

export async function setSessionCookie(response: NextResponse, user: PublicUser) {
  const token = await createSessionToken(user)
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}

export const sessionCookieName = COOKIE_NAME
