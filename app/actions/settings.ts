'use server'

import { prisma }                    from '@/lib/db'
import { logAudit, getCurrentUser }  from '@/lib/audit'
import { revalidatePath }            from 'next/cache'

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function listCompanies() {
  return prisma.company.findMany({ orderBy: { name: 'asc' } })
}

export async function getCompany(id: string) {
  return prisma.company.findUnique({ where: { id } })
}

export async function listBranches(companyId?: string) {
  const branches = await prisma.branch.findMany({
    where:   companyId && companyId !== 'all' ? { companyId } : {},
    orderBy: { name: 'asc' },
  })
  return branches.map(b => ({ ...b, createdAt: b.createdAt.toISOString() }))
}

export async function createBranch(name: string, companyId: string) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  const branch = await prisma.branch.create({
    data: { name: name.trim(), companyId },
  })
  return { ...branch, createdAt: branch.createdAt.toISOString() }
}

// ─── Mutation ─────────────────────────────────────────────────────────────────

export async function updateCompany(id: string, data: {
  name?:                  string
  tagline?:               string
  taglineLine2?:          string
  fullName?:              string
  addressGhana?:          string
  addressUSA?:            string
  phoneGhana?:            string
  mobileGhana?:           string
  phoneUSA?:              string
  email?:                 string
  website?:               string
  brandSubtitle?:         string
  authoriserName?:        string
  authoriserDesignation?: string
  logoUrl?:               string | null
}) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  const company = await prisma.company.update({
    where: { id },
    data:  {
      ...(data.name                  !== undefined && { name:                  data.name.trim() }),
      ...(data.tagline               !== undefined && { tagline:               data.tagline.trim() }),
      ...(data.taglineLine2          !== undefined && { taglineLine2:          data.taglineLine2.trim() }),
      ...(data.fullName              !== undefined && { fullName:              data.fullName.trim() }),
      ...(data.addressGhana          !== undefined && { addressGhana:          data.addressGhana.trim() }),
      ...(data.addressUSA            !== undefined && { addressUSA:            data.addressUSA.trim() }),
      ...(data.phoneGhana            !== undefined && { phoneGhana:            data.phoneGhana.trim() }),
      ...(data.mobileGhana           !== undefined && { mobileGhana:           data.mobileGhana.trim() }),
      ...(data.phoneUSA              !== undefined && { phoneUSA:              data.phoneUSA.trim() }),
      ...(data.email                 !== undefined && { email:                 data.email.trim().toLowerCase() }),
      ...(data.website               !== undefined && { website:               data.website.trim() }),
      ...(data.brandSubtitle         !== undefined && { brandSubtitle:         data.brandSubtitle.trim() }),
      ...(data.authoriserName        !== undefined && { authoriserName:        data.authoriserName.trim() }),
      ...(data.authoriserDesignation !== undefined && { authoriserDesignation: data.authoriserDesignation.trim() }),
      ...(data.logoUrl               !== undefined && { logoUrl:               data.logoUrl || null }),
    },
  })

  await logAudit({
    action:       'SETTINGS_UPDATED',
    email:        actor.email,
    userId:       actor.id,
    resourceType: 'Company',
    resourceId:   id,
    metadata:     `updated settings for ${company.code}`,
  })

  revalidatePath('/settings')
  return company
}
