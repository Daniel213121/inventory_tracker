'use server'

import { prisma }        from '@/lib/db'
import { logAudit, getCurrentUser } from '@/lib/audit'
import * as bcrypt       from 'bcryptjs'

export async function createAccount(data: {
  name:     string
  email:    string
  password: string
}) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  const hash = await bcrypt.hash(data.password, 12)

  const newUser = await prisma.user.create({
    data: {
      name:     data.name.trim(),
      email:    data.email.toLowerCase().trim(),
      password: hash,
      active:   true,
    },
    select: { id: true, name: true, email: true, active: true, createdAt: true, lastLogin: true },
  })

  await logAudit({
    action:       'ACCOUNT_CREATED',
    email:        actor.email,
    userId:       actor.id,
    resourceType: 'User',
    resourceId:   newUser.id,
    metadata:     `created account for ${newUser.email}`,
  })

  return newUser
}

export async function setAccountActive(targetId: string, active: boolean) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  const updated = await prisma.user.update({
    where:  { id: targetId },
    data:   { active },
    select: { id: true, name: true, email: true, active: true, createdAt: true, lastLogin: true },
  })

  await logAudit({
    action:       active ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_DEACTIVATED',
    email:        actor.email,
    userId:       actor.id,
    resourceType: 'User',
    resourceId:   targetId,
    metadata:     `${active ? 'activated' : 'deactivated'} ${updated.email}`,
  })

  return updated
}

export async function requestPasswordReset(targetId: string) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  const target = await prisma.user.findUnique({
    where:  { id: targetId },
    select: { email: true },
  })
  if (!target) throw new Error('User not found')

  await logAudit({
    action:       'PASSWORD_RESET_REQUESTED',
    email:        actor.email,
    userId:       actor.id,
    resourceType: 'User',
    resourceId:   targetId,
    metadata:     `reset link requested for ${target.email}`,
  })
}

export async function listUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, active: true, createdAt: true, lastLogin: true },
    orderBy: { createdAt: 'asc' },
  })
}
