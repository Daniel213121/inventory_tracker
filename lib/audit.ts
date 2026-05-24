'use server'

import { prisma }  from './db'
import { headers } from 'next/headers'
import { cookies } from 'next/headers'
import type { AuditAction } from '@prisma/client'

export async function logAudit(params: {
  action:        AuditAction
  email:         string
  userId?:       string
  resourceType?: string
  resourceId?:   string
  metadata?:     string
}) {
  const h  = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() ?? h.get('x-real-ip') ?? undefined
  const ua = h.get('user-agent') ?? undefined

  await prisma.auditLog.create({
    data: { ...params, ipAddress: ip, userAgent: ua },
  })
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_session')?.value
  if (!token) return null

  return prisma.user.findUnique({
    where:  { sessionToken: token, sessionExpiresAt: { gt: new Date() } },
    select: { id: true, name: true, email: true },
  })
}
