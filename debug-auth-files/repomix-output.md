This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
REPORT.md
src/app/api/auth/demo-login/route.ts
src/app/api/auth/login/route.ts
src/app/api/auth/register/route.ts
src/app/auth/login/page.tsx
src/lib/auth/ensure-users.ts
src/lib/auth/session.ts
src/lib/db/client.ts
src/lib/db/init.ts
src/lib/db/repositories/users.ts
```

# Files

## File: REPORT.md
```markdown
# Auth/Supabase Production Debug Report

## Main symptoms

- Production site: `https://neo-gallery-eight.vercel.app`
- Failing endpoints:
  - `POST /api/auth/demo-login`
  - `POST /api/auth/login`
  - potentially `POST /api/auth/register`
- Typical user-facing result:
  - `500 Internal Server Error`
  - sometimes empty body
  - sometimes JSON body like `{ "error": "Не удалось выполнить демо-вход" }`

## What was already confirmed

- Supabase project is real and reachable:
  - `https://hnjvmazujuqboznojbux.supabase.co`
- Database is not empty.
- Table `users` exists and contains demo/admin rows.
- `NEXT_PUBLIC_SUPABASE_URL` was previously corrupted and was fixed.
- `JWT_SECRET` was previously empty and was fixed in Vercel UI.
- `SUPABASE_SERVICE_ROLE_KEY` was previously placeholder text and later also appeared empty in Vercel edit form.
- Current code now has a fallback in server DB client:
  - use `SUPABASE_SERVICE_ROLE_KEY`
  - otherwise use `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Most suspicious root cause

Vercel environment variables are inconsistent with what the UI shows.

Observed behavior:

1. Vercel UI listed `SUPABASE_SERVICE_ROLE_KEY`.
2. But production logs still showed:
   - `Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY`
3. When opening the variable for edit, its value was empty at least once.
4. Earlier, `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` placeholders were not properly replaced and sometimes remained placeholder values.

That means the likely issue is one of these:

- Vercel env value not actually saved even though UI says it exists.
- Vercel redeploy not consuming the latest env value.
- Variable exists only for one environment path but not the runtime actually serving `neo-gallery-eight.vercel.app`.
- Vercel UI edit flow is unreliable and silently preserving empty/old value.

## Current code-level suspicion points

### 1. `initializeDatabase()`

File: `src/lib/db/init.ts`

Why suspicious:

- It fails hard before route handler logic continues.
- Earlier logs proved auth route crashed here with missing env errors.

### 2. `getSupabaseAdmin()`

File: `src/lib/db/client.ts`

Why suspicious:

- This is the single source of Supabase server client creation.
- Any missing/wrong env here breaks every auth repository call.
- Current code includes fallback to anon key because production env looked unreliable.

### 3. Auth route handlers

Files:

- `src/app/api/auth/demo-login/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`

Why suspicious:

- They all call `initializeDatabase()` before entering actual business logic.
- If env is wrong, they fail immediately.
- They collapse many internal failures into generic `500` responses.

### 4. Session creation

File: `src/lib/auth/session.ts`

Why suspicious:

- Depends on `JWT_SECRET`.
- Earlier this variable was definitely empty in Vercel.
- Any failure here breaks login even if database query succeeds.

### 5. Demo account bootstrap logic

Files:

- `src/lib/auth/ensure-users.ts`
- `src/lib/db/repositories/users.ts`

Why suspicious:

- `demo-login` depends on these functions.
- If insert/select policy or client auth is wrong, this path breaks.
- However, local checks showed the DB itself allows reads/inserts with anon key in current project state.

## Important production log evidence

### Earlier state

Logs showed malformed/placeholder Supabase config issues, including:

- corrupted Supabase URL in outgoing request
- missing `JWT_SECRET`
- placeholder `SUPABASE_SERVICE_ROLE_KEY`

### Latest important log

For current production deployment, Vercel logs showed:

`Error: Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY`

This happened even after the variable was visible in Vercel settings.

That is the strongest indicator that the real bug is around Vercel env persistence / rollout.

## Local checks that succeeded

Using local Node script against Supabase project:

- reading `users` with anon key succeeded
- inserting a temp user with anon key succeeded
- deleting that temp user with anon key succeeded

This suggests the database itself is not the primary blocker right now.

## Suggested investigation order for your friend

1. Verify current Vercel runtime env, not just UI values.
2. Check whether `SUPABASE_SERVICE_ROLE_KEY` is truly present in the deployed function environment.
3. Check whether `neo-gallery-eight.vercel.app` points to the newest deployment and correct environment scope.
4. Temporarily add explicit logging around:
   - `initializeDatabase()`
   - `getSupabaseAdmin()`
   - `setSessionCookie()`
5. If Vercel env remains unreliable, consider removing dependency on `SUPABASE_SERVICE_ROLE_KEY` for current auth flow and use anon key temporarily until env issue is fixed.

## Files included in this folder

- `src/app/api/auth/demo-login/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/auth/login/page.tsx`
- `src/lib/db/client.ts`
- `src/lib/db/init.ts`
- `src/lib/auth/session.ts`
- `src/lib/auth/ensure-users.ts`
- `src/lib/db/repositories/users.ts`
```

## File: src/app/api/auth/demo-login/route.ts
```typescript
import { NextResponse } from 'next/server'
import { ensureAdminUser, ensureDemoUser } from '@/lib/auth/ensure-users'
import { setSessionCookie } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/init'
import { toPublicUser } from '@/lib/db/repositories/users'
import type { UserRole } from '@/lib/db/types'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  initializeDatabase()

  try {
    const body = await request.json()
    const role = String(body.role ?? '') as UserRole

    if (!['visitor', 'artist', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Неизвестная демо-роль' }, { status: 400 })
    }

    const user = role === 'admin' ? await ensureAdminUser() : await ensureDemoUser(role)

    const publicUser = toPublicUser(user)

    if (!publicUser) {
      return NextResponse.json({ error: 'Демо-аккаунт не найден' }, { status: 404 })
    }

    const response = NextResponse.json({ user: publicUser })
    await setSessionCookie(response, publicUser)
    return response
  } catch {
    return NextResponse.json({ error: 'Не удалось выполнить демо-вход' }, { status: 500 })
  }
}
```

## File: src/app/api/auth/login/route.ts
```typescript
import { NextResponse } from 'next/server'
import { setSessionCookie } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/init'
import { verifyUserCredentials } from '@/lib/db/repositories/users'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  initializeDatabase()

  try {
    const body = await request.json()
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const user = await verifyUserCredentials(email, password)

    if (!user) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
    }

    const response = NextResponse.json({ user })
    await setSessionCookie(response, user)
    return response
  } catch {
    return NextResponse.json({ error: 'Не удалось выполнить вход' }, { status: 500 })
  }
}
```

## File: src/app/api/auth/register/route.ts
```typescript
import { NextResponse } from 'next/server'
import { setSessionCookie } from '@/lib/auth/session'
import { initializeDatabase } from '@/lib/db/init'
import { createUser, findUserByEmail } from '@/lib/db/repositories/users'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  initializeDatabase()

  try {
    const body = await request.json()
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')

    if (!email || !password) {
      return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Пароль должен быть не короче 6 символов' }, { status: 400 })
    }

    if (await findUserByEmail(email)) {
      return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 409 })
    }

    const user = await createUser(email, password)
    const response = NextResponse.json({ user })
    await setSessionCookie(response, user)
    return response
  } catch {
    return NextResponse.json({ error: 'Не удалось зарегистрироваться' }, { status: 500 })
  }
}
```

## File: src/app/auth/login/page.tsx
```typescript
'use client'

import { useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Palette, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { readApiResponse } from '@/hooks/use-api'

export default function LoginPage() {
const { login, register, setUser } = useAuthStore()
const router = useRouter()
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [showPassword, setShowPassword] = useState(false)
const [isSignUp, setIsSignUp] = useState(false)
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault()
setError('')
setLoading(true)

try {
if (isSignUp) {
await register(email, password)
} else {
await login(email, password)
}

router.push('/profile')
} catch (err: unknown) {
setError(err instanceof Error ? err.message : 'Ошибка авторизации')
} finally {
setLoading(false)
}
}

  const demoUsers = [
 { label: 'Демо: посетитель', role: 'visitor' as const },
 { label: 'Демо: автор', role: 'artist' as const },
 { label: 'Демо: админ', role: 'admin' as const },
 ]

return (
<div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4">
<div className="absolute inset-0 overflow-hidden">
<div className="animate-morph absolute left-1/4 top-1/3 h-48 w-48 bg-accent/10 blur-[100px]" />
<div className="animate-morph absolute right-1/4 bottom-1/4 h-64 w-64 bg-accent/5 blur-[120px]" style={{ animationDelay: '3s' }} />
</div>

<motion.div
initial={{ opacity: 0, y: 30, scale: 0.95 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
className="relative z-10 w-full max-w-md"
>
<div className="mb-8 text-center">
<motion.div
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 animate-pulse-glow"
>
<Palette className="h-7 w-7 text-accent" />
</motion.div>
<motion.h1
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.3 }}
className="text-3xl font-bold"
>
{isSignUp ? 'Регистрация' : 'Вход'}
</motion.h1>
<motion.p
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.4 }}
className="mt-2 text-sm text-muted-foreground"
>
Войдите в мир цифрового искусства
</motion.p>
</div>

<div className="glass rounded-2xl p-6 shadow-[0_0_40px_rgba(124,91,245,0.08)]">
<form onSubmit={handleSubmit} className="flex flex-col gap-4">
<motion.div
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: 0.3 }}
>
<label className="mb-1 block text-sm font-medium" htmlFor="email">
Email
</label>
<div className="relative">
<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
<input
id="email"
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
className="w-full rounded-lg border border-border bg-background/50 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent focus:shadow-[0_0_15px_rgba(124,91,245,0.1)]"
placeholder="your@email.com"
required
/>
</div>
</motion.div>

<motion.div
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: 0.4 }}
>
<label
className="mb-1 block text-sm font-medium"
htmlFor="password"
>
Пароль
</label>
<div className="relative">
<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
<input
id="password"
type={showPassword ? 'text' : 'password'}
value={password}
onChange={(e) => setPassword(e.target.value)}
className="w-full rounded-lg border border-border bg-background/50 py-2.5 pl-10 pr-10 text-sm transition-all focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent focus:shadow-[0_0_15px_rgba(124,91,245,0.1)]"
placeholder="••••••••"
required
minLength={6}
/>
<button
type="button"
onClick={() => setShowPassword(!showPassword)}
className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
>
{showPassword ? (
<EyeOff className="h-4 w-4" />
) : (
<Eye className="h-4 w-4" />
)}
</button>
</div>
</motion.div>

<AnimatePresence>
{error && (
<motion.div
initial={{ opacity: 0, height: 0 }}
animate={{ opacity: 1, height: 'auto' }}
exit={{ opacity: 0, height: 0 }}
className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive"
>
{error}
</motion.div>
)}
</AnimatePresence>

<motion.button
type="submit"
disabled={loading}
whileHover={{ scale: 1.01 }}
whileTap={{ scale: 0.98 }}
className="btn-primary w-full gap-2 py-3 disabled:opacity-50"
>
{loading ? (
<>
<Loader2 className="h-4 w-4 animate-spin" />
Загрузка...
</>
) : isSignUp
? 'Зарегистрироваться'
: 'Войти'}
</motion.button>
</form>

<p className="mt-6 text-center text-sm text-muted-foreground">
{isSignUp ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
<button
onClick={() => {
setIsSignUp(!isSignUp)
setError('')
}}
className="font-medium text-accent transition-colors hover:text-accent/80"
>
{isSignUp ? 'Войти' : 'Регистрация'}
</button>
</p>

<div className="mt-6 border-t border-border/50 pt-6">
<p className="mb-3 text-center text-xs text-muted-foreground">
 Быстрый вход для локальной проверки ролей:
</p>
<div className="flex flex-col gap-2">
{demoUsers.map((demo, i) => (
<motion.button
key={demo.role}
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.6 + i * 0.1 }}
onClick={async () => {
setLoading(true)
setError('')
try {
                const response = await fetch('/api/auth/demo-login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ role: demo.role }),
                })
                const data = await readApiResponse<{ user: ReturnType<typeof useAuthStore.getState>['user']; error?: string }>(response)
                setUser(data.user)
                router.push('/profile')
} catch (err: unknown) {
setError(err instanceof Error ? err.message : 'Ошибка входа')
} finally {
setLoading(false)
}
}}
className="btn-secondary w-full py-2 text-sm transition-all hover:border-accent/30 hover:shadow-[0_0_15px_rgba(124,91,245,0.08)]"
>
{demo.label}
</motion.button>
))}
</div>
</div>
</div>
</motion.div>
</div>
)
}
```

## File: src/lib/auth/ensure-users.ts
```typescript
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
```

## File: src/lib/auth/session.ts
```typescript
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
```

## File: src/lib/db/client.ts
```typescript
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

function getEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

declare global {
  // eslint-disable-next-line no-var
  var __neoGallerySupabaseAdmin: SupabaseClient<Database> | undefined
}

export function getSupabaseAdmin() {
  if (!globalThis.__neoGallerySupabaseAdmin) {
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseKey) {
      throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY')
    }

    globalThis.__neoGallerySupabaseAdmin = createClient<Database>(
      getEnv('NEXT_PUBLIC_SUPABASE_URL'),
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }

  return globalThis.__neoGallerySupabaseAdmin
}

export function nowIso() {
  return new Date().toISOString()
}

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}
```

## File: src/lib/db/init.ts
```typescript
let initialized = false

export function initializeDatabase() {
  if (initialized) {
    return
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY')
  }

  initialized = true
}
```

## File: src/lib/db/repositories/users.ts
```typescript
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
```
