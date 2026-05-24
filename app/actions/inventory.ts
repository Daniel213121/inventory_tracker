'use server'

import { prisma }                    from '@/lib/db'
import { logAudit, getCurrentUser }  from '@/lib/audit'
import { revalidatePath }            from 'next/cache'
import type { Condition, Prisma }     from '@prisma/client'

// ─── Serializer ───────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeItem(item: any) {
  const units        = item.serialUnits ?? []
  const inStock      = units.filter((u: any) => u.status === 'IN_STOCK')
  const quantity     = item.isSerialised
    ? inStock.length
    : item.qtyNew + item.qtyUsed + item.qtyFaulty
  const qtyNew    = item.isSerialised ? inStock.filter((u: any) => u.condition === 'NEW').length    : item.qtyNew
  const qtyUsed   = item.isSerialised ? inStock.filter((u: any) => u.condition === 'USED').length   : item.qtyUsed
  const qtyFaulty = item.isSerialised ? inStock.filter((u: any) => u.condition === 'FAULTY').length : item.qtyFaulty

  return {
    id:           item.id,
    companyId:    item.companyId,
    categoryId:   item.categoryId,
    category: {
      id:        item.category.id,
      value:     item.category.value,
      label:     item.category.label,
      isDefault: item.category.isDefault,
      createdAt: item.category.createdAt.toISOString(),
    },
    name:         item.name,
    brand:        item.brand,
    model:        item.model,
    isSerialised: item.isSerialised,
    serialUnits:  units.map((u: any) => ({
      id:        u.id,
      itemId:    u.itemId,
      serial:    u.serial,
      condition: u.condition,
      status:    u.status,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    })),
    quantity,
    qtyNew,
    qtyUsed,
    qtyFaulty,
    threshold:    item.threshold,
    supplier:     item.supplier    ?? '',
    purchaseDate: item.purchaseDate.toISOString().slice(0, 10),
    description:  item.description ?? '',
    notes:        item.notes       ?? '',
    imageUrl:     item.imageUrl    ?? null,
    updated:      item.updatedAt.toISOString(),
  }
}

const ITEM_INCLUDE = { category: true, serialUnits: true } as const

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function listInventory(filters: {
  companyId?:  string
  categoryId?: string
  condition?:  string
  search?:     string
  page?:       number
  pageSize?:   number
} = {}) {
  const { companyId, categoryId, condition, search, page = 1, pageSize = 10 } = filters

  const and: Prisma.InventoryItemWhereInput[] = []

  if (companyId  && companyId  !== 'all') and.push({ companyId })
  if (categoryId && categoryId !== 'all') and.push({ categoryId })

  if (condition && condition !== 'all') {
    const c = condition as Condition
    const bucketKey = c === 'NEW' ? 'qtyNew' : c === 'USED' ? 'qtyUsed' : 'qtyFaulty'
    and.push({
      OR: [
        { isSerialised: false, [bucketKey]: { gt: 0 } },
        { isSerialised: true,  serialUnits: { some: { condition: c, status: 'IN_STOCK' } } },
      ],
    })
  }

  if (search) {
    and.push({
      OR: [
        { name:  { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { serialUnits: { some: { serial: { contains: search, mode: 'insensitive' } } } },
      ],
    })
  }

  const where: Prisma.InventoryItemWhereInput = and.length > 0 ? { AND: and } : {}

  const [total, items] = await Promise.all([
    prisma.inventoryItem.count({ where }),
    prisma.inventoryItem.findMany({
      where,
      include: ITEM_INCLUDE,
      orderBy: { updatedAt: 'desc' },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
    }),
  ])

  return {
    total,
    items: items.map(serializeItem),
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function getInventoryItem(id: string) {
  const item = await prisma.inventoryItem.findUnique({
    where:   { id },
    include: ITEM_INCLUDE,
  })
  return item ? serializeItem(item) : null
}

export async function listCategories() {
  const cats = await prisma.category.findMany({ orderBy: { label: 'asc' } })
  return cats.map(c => ({ ...c, createdAt: c.createdAt.toISOString() }))
}

export async function createCategory(label: string) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  const value = label.trim().toUpperCase().replace(/\s+/g, '_')

  const cat = await prisma.category.create({
    data: { value, label: label.trim(), isDefault: false },
  })
  return { ...cat, createdAt: cat.createdAt.toISOString() }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createInventoryItem(data: {
  companyId:    string
  categoryId:   string
  name:         string
  brand:        string
  model:        string
  isSerialised: boolean
  serials:      string[]
  condition:    string
  quantity:     number
  threshold:    number
  supplier?:    string
  purchaseDate: string
  description?: string
  notes?:       string
  imageUrl?:    string | null
}) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  const cond = data.condition as Condition

  const item = await prisma.inventoryItem.create({
    data: {
      companyId:    data.companyId,
      categoryId:   data.categoryId,
      name:         data.name.trim(),
      brand:        data.brand.trim(),
      model:        data.model.trim(),
      isSerialised: data.isSerialised,
      // Non-serialised: place all qty into the correct bucket
      qtyNew:    data.isSerialised ? 0 : (cond === 'NEW'    ? data.quantity : 0),
      qtyUsed:   data.isSerialised ? 0 : (cond === 'USED'   ? data.quantity : 0),
      qtyFaulty: data.isSerialised ? 0 : (cond === 'FAULTY' ? data.quantity : 0),
      threshold:    data.threshold,
      supplier:     data.supplier?.trim()    || null,
      purchaseDate: new Date(data.purchaseDate),
      description:  data.description?.trim() || null,
      notes:        data.notes?.trim()        || null,
      imageUrl:     data.imageUrl            ?? null,
      // Serialised: create one SerialUnit per serial at the given initial condition
      ...(data.isSerialised && data.serials.length > 0 && {
        serialUnits: {
          create: data.serials.map(s => ({
            serial:    s,
            condition: cond,
            status:    'IN_STOCK' as const,
          })),
        },
      }),
    },
    include: ITEM_INCLUDE,
  })

  await logAudit({
    action:       'INVENTORY_CREATED',
    email:        actor.email,
    userId:       actor.id,
    resourceType: 'InventoryItem',
    resourceId:   item.id,
    metadata:     `created ${item.name}`,
  })

  revalidatePath('/inventory')
  return serializeItem(item)
}

export async function updateInventoryItem(id: string, data: {
  categoryId?:   string
  name?:         string
  brand?:        string
  model?:        string
  threshold?:    number
  supplier?:     string | null
  purchaseDate?: string
  description?:  string | null
  notes?:        string | null
  imageUrl?:     string | null
}) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  const item = await prisma.inventoryItem.update({
    where: { id },
    data:  {
      ...(data.categoryId   !== undefined && { category: { connect: { id: data.categoryId } } }),
      ...(data.name         !== undefined && { name:         data.name.trim() }),
      ...(data.brand        !== undefined && { brand:        data.brand.trim() }),
      ...(data.model        !== undefined && { model:        data.model.trim() }),
      ...(data.threshold    !== undefined && { threshold:    data.threshold }),
      ...(data.supplier     !== undefined && { supplier:     data.supplier?.trim() || null }),
      ...(data.purchaseDate !== undefined && { purchaseDate: new Date(data.purchaseDate) }),
      ...(data.description  !== undefined && { description:  data.description?.trim() || null }),
      ...(data.notes        !== undefined && { notes:        data.notes?.trim() || null }),
      ...(data.imageUrl     !== undefined && { imageUrl:     data.imageUrl ?? null }),
    },
    include: ITEM_INCLUDE,
  })

  await logAudit({
    action:       'INVENTORY_UPDATED',
    email:        actor.email,
    userId:       actor.id,
    resourceType: 'InventoryItem',
    resourceId:   item.id,
    metadata:     `updated ${item.name}`,
  })

  revalidatePath('/inventory')
  revalidatePath(`/inventory/${id}`)
  return serializeItem(item)
}

export async function deleteInventoryItem(id: string) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  const existing = await prisma.inventoryItem.findUnique({ where: { id }, select: { name: true } })
  if (!existing) throw new Error('Item not found')

  await prisma.inventoryItem.delete({ where: { id } })

  await logAudit({
    action:       'INVENTORY_DELETED',
    email:        actor.email,
    userId:       actor.id,
    resourceType: 'InventoryItem',
    resourceId:   id,
    metadata:     `deleted ${existing.name}`,
  })

  revalidatePath('/inventory')
}

export async function importInventoryItems(
  rows: Array<{
    companyId:    string
    categoryId:   string
    name:         string
    brand:        string
    model:        string
    isSerialised: boolean
    serials:      string[]
    condition:    string
    quantity:     number
    threshold:    number
    supplier?:    string
    purchaseDate: string
    description?: string
    notes?:       string
  }>,
  filename:  string,
  companyId: string,
) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  const batch = await prisma.importBatch.create({
    data: { filename, rowCount: rows.length, importedBy: actor.id, companyId },
  })

  const items = await prisma.$transaction(
    rows.map(row => {
      const cond = row.condition as Condition
      return prisma.inventoryItem.create({
        data: {
          companyId:     row.companyId,
          categoryId:    row.categoryId,
          name:          row.name.trim(),
          brand:         row.brand.trim(),
          model:         row.model.trim(),
          isSerialised:  row.isSerialised,
          qtyNew:    row.isSerialised ? 0 : (cond === 'NEW'    ? row.quantity : 0),
          qtyUsed:   row.isSerialised ? 0 : (cond === 'USED'   ? row.quantity : 0),
          qtyFaulty: row.isSerialised ? 0 : (cond === 'FAULTY' ? row.quantity : 0),
          threshold:     row.threshold,
          supplier:      row.supplier?.trim()    || null,
          purchaseDate:  new Date(row.purchaseDate),
          description:   row.description?.trim() || null,
          notes:         row.notes?.trim()        || null,
          importBatchId: batch.id,
          ...(row.isSerialised && row.serials.length > 0 && {
            serialUnits: {
              create: row.serials.map(s => ({
                serial:    s,
                condition: cond,
                status:    'IN_STOCK' as const,
              })),
            },
          }),
        },
      })
    })
  )

  await logAudit({
    action:       'INVENTORY_IMPORTED',
    email:        actor.email,
    userId:       actor.id,
    resourceType: 'ImportBatch',
    resourceId:   batch.id,
    metadata:     `imported ${items.length} items from ${filename}`,
  })

  revalidatePath('/inventory')
  return { batchId: batch.id, count: items.length }
}
