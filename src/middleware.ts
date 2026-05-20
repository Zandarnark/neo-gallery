import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_PATHS = new Set([
  '/',
  '/exhibitions',
  '/auth/login',
  '/cart',
  '/checkout',
])

function getSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('Missing required environment variable: JWT_SECRET')
  }

  return new TextEncoder().encode(secret)
}

async function readSession(request: NextRequest) {
  const token = request.cookies.get('neo_session')?.value

  if (!token) {
    return null
  }

  try {
    const result = await jwtVerify(token, getSecret())
    return result.payload as { role?: string }
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicRoute =
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith('/exhibitions/') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/exhibitions') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/payments') ||
    pathname.startsWith('/api/analytics') ||
    pathname.includes('.')

  const session = await readSession(request)

  if (!isPublicRoute && !session) {
    return Response.redirect(new URL('/auth/login', request.url))
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!session || session.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (pathname.startsWith('/dashboard')) {
    if (!session || (session.role !== 'artist' && session.role !== 'admin')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
