import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

const INACTIVITY_SEC = 30 * 60   // 30 min sliding window

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_session')?.value

  let isLoggedIn = false

  if (token) {
    const user = await prisma.user.findUnique({
      where:  { sessionToken: token },
      select: { id: true, email: true, active: true, sessionExpiresAt: true },
    })

    if (user && user.active) {
      const now = new Date()

      // Absolute 8-hour limit exceeded
      if (user.sessionExpiresAt && user.sessionExpiresAt < now) {
        await prisma.user.update({
          where: { id: user.id },
          data:  { sessionToken: null, sessionExpiresAt: null },
        })
        await prisma.auditLog.create({
          data: {
            action:    'SESSION_EXPIRED',
            email:     user.email,
            userId:    user.id,
            ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0].trim()
                       ?? request.headers.get('x-real-ip')
                       ?? undefined,
          },
        })
        const res = NextResponse.redirect(new URL('/login', request.url))
        res.cookies.delete('auth_session')
        return res
      }

      // Session valid — extend server-side inactivity window
      await prisma.user.update({
        where: { id: user.id },
        data:  { sessionExpiresAt: new Date(Date.now() + INACTIVITY_SEC * 1000) },
      })

      isLoggedIn = true
      const res = pathname === '/login'
        ? NextResponse.redirect(new URL('/dashboard', request.url))
        : NextResponse.next()

      res.cookies.set('auth_session', token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge:   INACTIVITY_SEC,
        path:     '/',
      })
      return res
    }
  }

  // Not logged in
  if (!isLoggedIn && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
