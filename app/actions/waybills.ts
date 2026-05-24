'use server'

import { prisma }                    from '@/lib/db'
import { logAudit, getCurrentUser }  from '@/lib/audit'
import type { Prisma }               from '@prisma/client'

// ─── Serializers ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeWaybillSummary(w: any) {
  return {
    id:          w.id,
    number:      w.number,
    companyId:   w.companyId,
    companyCode: w.company?.code  ?? '',
    companyName: w.company?.name  ?? '',
    date:        w.date.toISOString().slice(0, 10),
    suppliedTo:  w.suppliedTo,
    lineCount:   (w.movements ?? []).length,
    generatedBy: w.generatedBy,
    generatedAt: w.generatedAt.toISOString(),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeWaybillDetail(w: any) {
  return {
    id:              w.id,
    number:          w.number,
    companyId:       w.companyId,
    date:            w.date.toISOString().slice(0, 10),
    suppliedTo:      w.suppliedTo,
    destinationCode: w.destinationCode,
    driverName:      w.driverName,
    generatedBy:     w.generatedBy,
    generatedAt:     w.generatedAt.toISOString(),
    company: w.company ? {
      id:                    w.company.id,
      name:                  w.company.name,
      code:                  w.company.code,
      tagline:               w.company.tagline,
      taglineLine2:          w.company.taglineLine2,
      fullName:              w.company.fullName,
      addressGhana:          w.company.addressGhana,
      addressUSA:            w.company.addressUSA,
      phoneGhana:            w.company.phoneGhana,
      mobileGhana:           w.company.mobileGhana,
      phoneUSA:              w.company.phoneUSA,
      email:                 w.company.email,
      website:               w.company.website,
      brandSubtitle:         w.company.brandSubtitle,
      authoriserName:        w.company.authoriserName,
      authoriserDesignation: w.company.authoriserDesignation,
    } : null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lines: (w.movements ?? []).map((m: any) => ({
      id:                m.id,
      qty:               m.quantity,
      name:              m.item?.name  ?? '',
      brand:             m.item?.brand ?? '',
      model:             m.item?.model ?? '',
      serialsDispatched: m.serialsDispatched ?? [],
    })),
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function listWaybills(filters: {
  companyId?: string
  search?:    string
  from?:      string
  to?:        string
  page?:      number
  pageSize?:  number
} = {}) {
  const { companyId, search, from, to, page = 1, pageSize = 20 } = filters

  const where: Prisma.WaybillWhereInput = {}
  if (companyId && companyId !== 'all') where.companyId = companyId
  if (from || to) {
    where.date = {
      ...(from ? { gte: new Date(from) }            : {}),
      ...(to   ? { lte: new Date(to + 'T23:59:59') } : {}),
    }
  }
  if (search) {
    where.OR = [
      { number:     { contains: search, mode: 'insensitive' } },
      { suppliedTo: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [total, waybills] = await Promise.all([
    prisma.waybill.count({ where }),
    prisma.waybill.findMany({
      where,
      include:  { company: true, movements: true },
      orderBy:  { date: 'desc' },
      skip:     (page - 1) * pageSize,
      take:     pageSize,
    }),
  ])

  return {
    total,
    pages:    Math.ceil(total / pageSize),
    page,
    pageSize,
    waybills: waybills.map(serializeWaybillSummary),
  }
}

export async function getWaybill(id: string) {
  const w = await prisma.waybill.findUnique({
    where:   { id },
    include: {
      company:   true,
      movements: { include: { item: true } },
    },
  })
  return w ? serializeWaybillDetail(w) : null
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export async function logWaybillPrint(id: string) {
  const actor = await getCurrentUser()
  if (!actor) return

  await logAudit({
    action:       'WAYBILL_PRINTED',
    email:        actor.email,
    userId:       actor.id,
    resourceType: 'Waybill',
    resourceId:   id,
  })
}
