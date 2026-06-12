'use server'

import { prisma }                    from '@/lib/db'
import { logAudit, getCurrentUser }  from '@/lib/audit'
import { revalidatePath }            from 'next/cache'
import type { AssetType, AssetCondition, AssetStatus, Prisma } from '@prisma/client'

// ─── Serializers ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeAsset(asset: any) {
  return {
    id:              asset.id,
    companyId:       asset.companyId,
    branchId:        asset.branchId,
    assetTag:        asset.assetTag,
    type:            asset.type,
    brand:           asset.brand,
    model:           asset.model,
    serial:          asset.serial,
    processor:       asset.processor       ?? undefined,
    ram:             asset.ram             ?? undefined,
    storage:         asset.storage         ?? undefined,
    operatingSystem: asset.operatingSystem ?? undefined,
    software:        asset.software        ?? [],
    purchaseDate:    asset.purchaseDate instanceof Date
      ? asset.purchaseDate.toISOString().slice(0, 10)
      : undefined,
    purchasePrice:   asset.purchasePrice != null ? Number(asset.purchasePrice) : undefined,
    warrantyExpiry:  asset.warrantyExpiry instanceof Date
      ? asset.warrantyExpiry.toISOString().slice(0, 10)
      : undefined,
    condition:       asset.condition,
    status:          asset.status,
    notes:           asset.notes ?? undefined,
    createdAt:       asset.createdAt.toISOString(),
    updatedAt:       asset.updatedAt.toISOString(),
    ...(asset.company && {
      company: {
        id:      asset.company.id,
        name:    asset.company.name,
        code:    asset.company.code,
        logoUrl: asset.company.logoUrl ?? null,
      },
    }),
    ...(asset.branch && {
      branch: {
        id:        asset.branch.id,
        companyId: asset.branch.companyId,
        name:      asset.branch.name,
        createdAt: asset.branch.createdAt.toISOString(),
      },
    }),
    ...(asset.assignments && {
      assignments: asset.assignments.map(serializeAssignment),
    }),
    ...(asset.transfers && {
      transfers: asset.transfers.map(serializeTransfer),
    }),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeAssignment(a: any) {
  return {
    id:         a.id,
    assetId:    a.assetId,
    employeeId: a.employeeId,
    assignedAt: a.assignedAt.toISOString().slice(0, 10),
    assignedBy: a.assignedBy,
    returnedAt: a.returnedAt ? a.returnedAt.toISOString().slice(0, 10) : null,
    returnedBy: a.returnedBy ?? null,
    condition:  a.condition ?? undefined,
    notes:      a.notes ?? undefined,
    ...(a.employee && { employee: serializeEmployeeBrief(a.employee) }),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeEmployeeBrief(e: any) {
  return {
    id:         e.id,
    companyId:  e.companyId,
    branchId:   e.branchId,
    employeeId: e.employeeId ?? undefined,
    name:       e.name,
    jobTitle:   e.jobTitle,
    department: e.department,
    email:      e.email ?? undefined,
    phone:      e.phone ?? undefined,
    joinedAt:   e.joinedAt instanceof Date ? e.joinedAt.toISOString().slice(0, 10) : e.joinedAt,
    resignedAt: e.resignedAt instanceof Date ? e.resignedAt.toISOString().slice(0, 10) : (e.resignedAt ?? null),
    active:     e.active,
    createdAt:  e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
    updatedAt:  e.updatedAt instanceof Date ? e.updatedAt.toISOString() : e.updatedAt,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeTransfer(t: any) {
  return {
    id:              t.id,
    referenceNumber: t.referenceNumber,
    assetId:         t.assetId,
    companyId:       t.companyId,
    fromEmployeeId:  t.fromEmployeeId ?? null,
    fromCondition:   t.fromCondition  ?? null,
    returnedAt:      t.returnedAt ? t.returnedAt.toISOString().slice(0, 10) : null,
    reason:          t.reason,
    reasonNotes:     t.reasonNotes ?? undefined,
    toEmployeeId:    t.toEmployeeId ?? null,
    assignedAt:      t.assignedAt ? t.assignedAt.toISOString().slice(0, 10) : null,
    processedBy:     t.processedBy,
    authorisedBy:    t.authorisedBy,
    generatedAt:     t.generatedAt.toISOString(),
  }
}

const ASSET_INCLUDE = { company: true, branch: true } as const

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function listAssets(filters: {
  companyId?: string
  branchId?:  string
  type?:      string
  status?:    string
  condition?: string
  search?:    string
  page?:      number
  pageSize?:  number
} = {}) {
  const { companyId, branchId, type, status, condition, search, page = 1, pageSize = 10 } = filters

  const and: Prisma.AssetWhereInput[] = []

  if (companyId && companyId !== 'all') and.push({ companyId })
  if (branchId  && branchId  !== 'all') and.push({ branchId })
  if (type      && type      !== 'all') and.push({ type: type as AssetType })
  if (status    && status    !== 'all') and.push({ status: status as AssetStatus })
  if (condition && condition !== 'all') and.push({ condition: condition as AssetCondition })

  if (search) {
    and.push({
      OR: [
        { brand:    { contains: search, mode: 'insensitive' } },
        { model:    { contains: search, mode: 'insensitive' } },
        { serial:   { contains: search, mode: 'insensitive' } },
        { assetTag: { contains: search, mode: 'insensitive' } },
      ],
    })
  }

  const where: Prisma.AssetWhereInput = and.length > 0 ? { AND: and } : {}

  const [total, assets] = await Promise.all([
    prisma.asset.count({ where }),
    prisma.asset.findMany({
      where,
      include:  ASSET_INCLUDE,
      orderBy:  { updatedAt: 'desc' },
      skip:     (page - 1) * pageSize,
      take:     pageSize,
    }),
  ])

  return {
    total,
    items: assets.map(serializeAsset),
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function getAsset(id: string) {
  const asset = await prisma.asset.findUnique({
    where:   { id },
    include: {
      company:     true,
      branch:      true,
      assignments: { include: { employee: true }, orderBy: { assignedAt: 'desc' } },
      transfers:   true,
    },
  })
  return asset ? serializeAsset(asset) : null
}

export async function listAssetAssignments(assetId: string) {
  const assignments = await prisma.assetAssignment.findMany({
    where:   { assetId },
    include: { employee: true },
    orderBy: { assignedAt: 'desc' },
  })
  return assignments.map(serializeAssignment)
}

export async function getAssetTransfer(id: string) {
  const transfer = await prisma.assetTransfer.findUnique({
    where:   { id },
    include: { asset: { include: ASSET_INCLUDE }, company: true },
  })
  if (!transfer) return null

  const [fromEmployee, toEmployee] = await Promise.all([
    transfer.fromEmployeeId ? prisma.employee.findUnique({ where: { id: transfer.fromEmployeeId } }) : null,
    transfer.toEmployeeId   ? prisma.employee.findUnique({ where: { id: transfer.toEmployeeId } })   : null,
  ])

  return {
    ...serializeTransfer(transfer),
    asset:        serializeAsset(transfer.asset),
    company:      transfer.company,
    fromEmployee: fromEmployee ? serializeEmployeeBrief(fromEmployee) : null,
    toEmployee:   toEmployee   ? serializeEmployeeBrief(toEmployee)   : null,
  }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createAsset(data: {
  companyId:        string
  branchId:         string
  assetTag:         string
  type:             string
  brand:            string
  model:            string
  serial:           string
  processor?:       string
  ram?:             string
  storage?:         string
  operatingSystem?: string
  software?:        string[]
  purchaseDate?:    string
  purchasePrice?:   number
  warrantyExpiry?:  string
  condition:        string
  status?:          string
  notes?:           string
}) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  let asset
  try {
    asset = await prisma.asset.create({
      data: {
        companyId:       data.companyId,
        branchId:        data.branchId,
        assetTag:        data.assetTag.trim(),
        type:            data.type as AssetType,
        brand:           data.brand.trim(),
        model:           data.model.trim(),
        serial:          data.serial.trim(),
        processor:       data.processor?.trim()       || null,
        ram:             data.ram?.trim()             || null,
        storage:         data.storage?.trim()         || null,
        operatingSystem: data.operatingSystem?.trim() || null,
        software:        data.software ?? [],
        purchaseDate:    data.purchaseDate    ? new Date(data.purchaseDate)    : null,
        purchasePrice:   data.purchasePrice   ?? null,
        warrantyExpiry:  data.warrantyExpiry  ? new Date(data.warrantyExpiry)  : null,
        condition:       data.condition as AssetCondition,
        status:          (data.status as AssetStatus) ?? 'AVAILABLE',
        notes:           data.notes?.trim() || null,
      },
      include: ASSET_INCLUDE,
    })
  } catch (err) {
    if (err instanceof Error && 'code' in err && (err as { code?: string }).code === 'P2002') {
      throw new Error('An asset with this asset tag or serial number already exists')
    }
    throw err
  }

  await logAudit({
    action:       'ASSET_CREATED',
    email:        actor.email,
    userId:       actor.id,
    resourceType: 'Asset',
    resourceId:   asset.id,
    metadata:     `created ${asset.assetTag} (${asset.brand} ${asset.model})`,
  })

  revalidatePath('/assets')
  return serializeAsset(asset)
}

export async function updateAsset(id: string, data: {
  companyId?:        string
  branchId?:         string
  assetTag?:         string
  type?:             string
  brand?:            string
  model?:            string
  serial?:           string
  processor?:        string | null
  ram?:              string | null
  storage?:          string | null
  operatingSystem?:  string | null
  software?:         string[]
  purchaseDate?:     string | null
  purchasePrice?:    number | null
  warrantyExpiry?:   string | null
  condition?:        string
  status?:           string
  notes?:            string | null
}) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  let asset
  try {
    asset = await prisma.asset.update({
      where: { id },
      data: {
        ...(data.companyId       !== undefined && { companyId:       data.companyId }),
        ...(data.branchId        !== undefined && { branchId:        data.branchId }),
        ...(data.assetTag        !== undefined && { assetTag:        data.assetTag.trim() }),
        ...(data.type            !== undefined && { type:            data.type as AssetType }),
        ...(data.brand           !== undefined && { brand:           data.brand.trim() }),
        ...(data.model           !== undefined && { model:           data.model.trim() }),
        ...(data.serial          !== undefined && { serial:          data.serial.trim() }),
        ...(data.processor       !== undefined && { processor:       data.processor?.trim()       || null }),
        ...(data.ram             !== undefined && { ram:             data.ram?.trim()             || null }),
        ...(data.storage         !== undefined && { storage:         data.storage?.trim()         || null }),
        ...(data.operatingSystem !== undefined && { operatingSystem: data.operatingSystem?.trim() || null }),
        ...(data.software        !== undefined && { software:        data.software }),
        ...(data.purchaseDate    !== undefined && { purchaseDate:    data.purchaseDate    ? new Date(data.purchaseDate)    : null }),
        ...(data.purchasePrice   !== undefined && { purchasePrice:   data.purchasePrice }),
        ...(data.warrantyExpiry  !== undefined && { warrantyExpiry:  data.warrantyExpiry  ? new Date(data.warrantyExpiry)  : null }),
        ...(data.condition       !== undefined && { condition:       data.condition as AssetCondition }),
        ...(data.status          !== undefined && { status:          data.status as AssetStatus }),
        ...(data.notes           !== undefined && { notes:           data.notes?.trim() || null }),
      },
      include: ASSET_INCLUDE,
    })
  } catch (err) {
    if (err instanceof Error && 'code' in err && (err as { code?: string }).code === 'P2002') {
      throw new Error('An asset with this asset tag or serial number already exists')
    }
    throw err
  }

  revalidatePath('/assets')
  revalidatePath(`/assets/${id}`)
  return serializeAsset(asset)
}

export async function deleteAsset(id: string) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  const existing = await prisma.asset.findUnique({
    where:   { id },
    select:  { assetTag: true, _count: { select: { assignments: true } } },
  })
  if (!existing) throw new Error('Asset not found')
  if (existing._count.assignments > 0) {
    throw new Error('Cannot delete an asset that has assignment history')
  }

  await prisma.asset.delete({ where: { id } })

  revalidatePath('/assets')
}

export async function assignAsset(data: {
  assetId:    string
  employeeId: string
  assignedBy: string
  assignedAt?: string
  notes?:     string
}) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  const [asset] = await prisma.$transaction([
    prisma.asset.update({
      where: { id: data.assetId },
      data:  { status: 'ASSIGNED' },
    }),
    prisma.assetAssignment.create({
      data: {
        assetId:    data.assetId,
        employeeId: data.employeeId,
        assignedAt: data.assignedAt ? new Date(data.assignedAt) : new Date(),
        assignedBy: data.assignedBy,
        notes:      data.notes?.trim() || null,
      },
    }),
  ])

  await logAudit({
    action:       'ASSET_ASSIGNED',
    email:        actor.email,
    userId:       actor.id,
    resourceType: 'Asset',
    resourceId:   data.assetId,
    metadata:     `assigned ${asset.assetTag} to employee ${data.employeeId}`,
  })

  revalidatePath('/assets')
  revalidatePath(`/assets/${data.assetId}`)
  revalidatePath('/employees')
  revalidatePath(`/employees/${data.employeeId}`)

  return serializeAsset(asset)
}

export async function createAssetTransfer(data: {
  assetId:        string
  companyId:      string
  fromEmployeeId?: string
  fromCondition?:  string
  reason:          string
  reasonNotes?:    string
  toEmployeeId?:   string
  processedBy:     string
  authorisedBy:    string
}) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  const company = await prisma.company.findUnique({ where: { id: data.companyId }, select: { code: true } })
  if (!company) throw new Error('Company not found')

  const existingCount = await prisma.assetTransfer.count({ where: { companyId: data.companyId } })
  const seq  = existingCount + 1
  const year = new Date().getFullYear().toString().slice(-2)
  const referenceNumber = `${company.code}/ASSET/${String(seq).padStart(3, '0')}/${year}`

  const now = new Date()

  const result = await prisma.$transaction(async (tx) => {
    // Close out current assignment for the outgoing employee, if any
    if (data.fromEmployeeId) {
      const openAssignment = await tx.assetAssignment.findFirst({
        where: { assetId: data.assetId, employeeId: data.fromEmployeeId, returnedAt: null },
        orderBy: { assignedAt: 'desc' },
      })
      if (openAssignment) {
        await tx.assetAssignment.update({
          where: { id: openAssignment.id },
          data: {
            returnedAt: now,
            returnedBy: data.processedBy,
            condition:  data.fromCondition ? (data.fromCondition as AssetCondition) : undefined,
          },
        })
      }
    }

    // Create the transfer record
    const transfer = await tx.assetTransfer.create({
      data: {
        referenceNumber,
        assetId:        data.assetId,
        companyId:      data.companyId,
        fromEmployeeId: data.fromEmployeeId ?? null,
        fromCondition:  data.fromCondition ? (data.fromCondition as AssetCondition) : null,
        returnedAt:     data.fromEmployeeId ? now : null,
        reason:         data.reason as Prisma.AssetTransferCreateInput['reason'],
        reasonNotes:    data.reasonNotes?.trim() || null,
        toEmployeeId:   data.toEmployeeId ?? null,
        assignedAt:     data.toEmployeeId ? now : null,
        processedBy:    data.processedBy,
        authorisedBy:   data.authorisedBy.trim(),
      },
    })

    // Handle the asset's new state
    if (data.toEmployeeId) {
      await tx.assetAssignment.create({
        data: {
          assetId:    data.assetId,
          employeeId: data.toEmployeeId,
          assignedAt: now,
          assignedBy: data.processedBy,
        },
      })
      await tx.asset.update({
        where: { id: data.assetId },
        data:  { status: 'ASSIGNED' },
      })
    } else if (data.reason === 'BEYOND_REPAIR') {
      await tx.asset.update({
        where: { id: data.assetId },
        data:  { status: 'RETIRED', condition: 'BEYOND_REPAIR' },
      })
    } else {
      await tx.asset.update({
        where: { id: data.assetId },
        data:  { status: 'AVAILABLE' },
      })
    }

    return transfer
  })

  await logAudit({
    action:       'ASSET_TRANSFERRED',
    email:        actor.email,
    userId:       actor.id,
    resourceType: 'AssetTransfer',
    resourceId:   result.id,
    metadata:     `generated ${result.referenceNumber}`,
  })

  revalidatePath('/assets')
  revalidatePath(`/assets/${data.assetId}`)
  revalidatePath(`/assets/transfers/${result.id}`)
  revalidatePath('/employees')

  return serializeTransfer(result)
}
