'use server'

import { prisma }       from '@/lib/db'
import { logAudit }     from '@/lib/audit'
import * as bcrypt      from 'bcryptjs'
import { cookies }      from 'next/headers'
import { randomBytes }  from 'crypto'

const MAX_ATTEMPTS    = 5
const LOCK_MINUTES    = 15
const INACTIVITY_SEC  = 30 * 60
const ALLOWED_DOMAINS = ['virtualinfosecafrica.com', 'virtualsecurityafrica.com']
const GENERIC_ERROR   = 'Invalid email address or password'

type LoginResult =
  | { success: true;  user: { id: string; name: string; email: string } }
  | { success: false; error: string }

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  const normalized = email.toLowerCase().trim()

  // Domain gate — no DB query for outside domains
  const domain = normalized.split('@')[1] ?? ''
  if (!ALLOWED_DOMAINS.includes(domain)) {
    await logAudit({ action: 'LOGIN_FAILED', email: normalized, metadata: 'invalid domain' })
    return { success: false, error: GENERIC_ERROR }
  }

  const user = await prisma.user.findUnique({ where: { email: normalized } })

  if (!user) {
    await logAudit({ action: 'LOGIN_FAILED', email: normalized, metadata: 'user not found' })
    return { success: false, error: GENERIC_ERROR }
  }

  if (!user.active) {
    await logAudit({ action: 'LOGIN_FAILED', email: normalized, userId: user.id, metadata: 'account inactive' })
    return { success: false, error: 'Your account is inactive. Contact an administrator to restore access.' }
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000)
    await logAudit({ action: 'LOGIN_LOCKED', email: normalized, userId: user.id, metadata: `locked ${mins}min remaining` })
    return { success: false, error: `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.` }
  }

  const ok = await bcrypt.compare(password, user.password)

  if (!ok) {
    const attempts = user.failedAttempts + 1
    const locked   = attempts >= MAX_ATTEMPTS
    await prisma.user.update({
      where: { id: user.id },
      data:  { failedAttempts: attempts, lockedUntil: locked ? new Date(Date.now() + LOCK_MINUTES * 60000) : null },
    })
    await logAudit({
      action:   locked ? 'LOGIN_LOCKED' : 'LOGIN_FAILED',
      email:    normalized, userId: user.id,
      metadata: `attempt ${attempts}/${MAX_ATTEMPTS}`,
    })
    if (locked) return { success: false, error: `Too many failed attempts. Try again in ${LOCK_MINUTES} minutes.` }
    return { success: false, error: GENERIC_ERROR }
  }

  const sessionToken     = randomBytes(32).toString('hex')
  const sessionExpiresAt = new Date(Date.now() + INACTIVITY_SEC * 1000)

  await prisma.user.update({
    where: { id: user.id },
    data:  { lastLogin: new Date(), sessionToken, sessionExpiresAt, failedAttempts: 0, lockedUntil: null },
  })
  await logAudit({ action: 'LOGIN_SUCCESS', email: normalized, userId: user.id })

  const cookieStore = await cookies()
  cookieStore.set('auth_session', sessionToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   INACTIVITY_SEC,
    path:     '/',
  })

  return { success: true, user: { id: user.id, name: user.name, email: user.email } }
}

export async function getMyProfile() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_session')?.value
  if (!token) return null

  return prisma.user.findUnique({
    where:  { sessionToken: token, sessionExpiresAt: { gt: new Date() } },
    select: { id: true, name: true, email: true, active: true, createdAt: true, lastLogin: true },
  })
}

export async function updateMyProfile(data: { name: string; email: string }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_session')?.value
  if (!token) throw new Error('Unauthorized')

  const actor = await prisma.user.findUnique({
    where:  { sessionToken: token, sessionExpiresAt: { gt: new Date() } },
    select: { id: true, email: true },
  })
  if (!actor) throw new Error('Unauthorized')

  const updated = await prisma.user.update({
    where:  { id: actor.id },
    data:   { name: data.name.trim(), email: data.email.toLowerCase().trim() },
    select: { id: true, name: true, email: true, active: true, createdAt: true, lastLogin: true },
  })

  await logAudit({ action: 'PROFILE_UPDATED', email: actor.email, userId: actor.id })
  return updated
}

export async function changeMyPassword(data: { currentPw: string; newPw: string }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_session')?.value
  if (!token) throw new Error('Unauthorized')

  const user = await prisma.user.findUnique({
    where: { sessionToken: token, sessionExpiresAt: { gt: new Date() } },
  })
  if (!user) throw new Error('Unauthorized')

  const ok = await bcrypt.compare(data.currentPw, user.password)
  if (!ok) throw new Error('Current password is incorrect')

  const hash = await bcrypt.hash(data.newPw, 12)
  await prisma.user.update({ where: { id: user.id }, data: { password: hash } })
  await logAudit({ action: 'PASSWORD_CHANGED', email: user.email, userId: user.id })
}

export async function logoutUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_session')?.value

  if (token) {
    const user = await prisma.user.findUnique({
      where:  { sessionToken: token },
      select: { id: true, email: true },
    })
    if (user) {
      await prisma.user.update({ where: { id: user.id }, data: { sessionToken: null, sessionExpiresAt: null } })
      await logAudit({ action: 'LOGOUT', email: user.email, userId: user.id })
    }
  }

  cookieStore.delete('auth_session')
}
