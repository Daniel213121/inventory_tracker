'use server'

import { prisma } from '@/lib/db'

export type DashboardMovement = {
  id:             string
  itemId:         string
  itemName:       string
  companyId:      string
  companyCode:    string
  companyName:    string
  companyLogoUrl: string | null
  type:           'IN' | 'OUT'
  quantity:       number
  movedBy:        string
  movedAt:        string
}

export type DashboardInventorySummary = {
  companyId:  string
  categoryId: string
  quantity:   number
}

export type DashboardData = {
  totalItems:        number
  itemsOut:          number
  waybillCount:      number
  recentMovements:   DashboardMovement[]
  companies:         { id: string; name: string; code: string }[]
  categories:        { id: string; label: string }[]
  inventory:         DashboardInventorySummary[]
  totalAssets:       number
  assetsAssigned:    number
  assetsUnassigned:  number
  transfersThisMonth: number
}

export async function getDashboardData(): Promise<DashboardData> {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    inventoryItems, allMovements, waybillCount, companies, categories,
    totalAssets, assetsAssigned, assetsUnassigned, transfersThisMonth,
  ] = await Promise.all([
    prisma.inventoryItem.findMany({
      select: {
        id:           true,
        companyId:    true,
        categoryId:   true,
        isSerialised: true,
        qtyNew:       true,
        qtyUsed:      true,
        qtyFaulty:    true,
        _count: { select: { serialUnits: { where: { status: 'IN_STOCK' } } } },
      },
    }),

    prisma.movement.findMany({
      include: { item: { select: { name: true } }, company: { select: { code: true, name: true, logoUrl: true } } },
      orderBy: { movedAt: 'asc' },
    }),

    prisma.waybill.count(),

    prisma.company.findMany({ orderBy: { name: 'asc' } }),

    prisma.category.findMany({ orderBy: { label: 'asc' } }),

    prisma.asset.count(),

    prisma.asset.count({ where: { status: 'ASSIGNED' } }),

    prisma.asset.count({ where: { status: 'AVAILABLE' } }),

    prisma.assetTransfer.count({ where: { generatedAt: { gte: startOfMonth } } }),
  ])

  type InvRow  = typeof inventoryItems[number]
  type MovRow  = typeof allMovements[number]
  type CompRow = typeof companies[number]
  type CatRow  = typeof categories[number]

  // Compute currently dispatched items (last movement per item is OUT)
  const byItem = new Map<string, MovRow>()
  for (const m of allMovements) {
    if (m.type === 'OUT' && m.waybillId) byItem.set(m.itemId, m)
    else if (m.type === 'IN')            byItem.delete(m.itemId)
  }
  const itemsOut = [...byItem.values()].reduce((s: number, m: MovRow) => s + m.quantity, 0)

  const totalItems = inventoryItems.reduce((s: number, item: InvRow) => {
    const qty = item.isSerialised
      ? item._count.serialUnits
      : item.qtyNew + item.qtyUsed + item.qtyFaulty
    return s + qty
  }, 0)

  const recentMovements = [...allMovements]
    .sort((a: MovRow, b: MovRow) => b.movedAt.getTime() - a.movedAt.getTime())
    .slice(0, 10)
    .map((m: MovRow) => ({
      id:          m.id,
      itemId:      m.itemId,
      itemName:    m.item.name,
      companyId:   m.companyId,
      companyCode:    m.company.code,
      companyName:    m.company.name,
      companyLogoUrl: m.company.logoUrl ?? null,
      type:           m.type as 'IN' | 'OUT',
      quantity:    m.quantity,
      movedBy:     m.movedBy,
      movedAt:     m.movedAt.toISOString(),
    }))

  const inventory: DashboardInventorySummary[] = inventoryItems.map((item: InvRow) => ({
    companyId:  item.companyId,
    categoryId: item.categoryId,
    quantity:   item.isSerialised
      ? item._count.serialUnits
      : item.qtyNew + item.qtyUsed + item.qtyFaulty,
  }))

  return {
    totalItems,
    itemsOut,
    waybillCount,
    recentMovements,
    companies: companies.map((c: CompRow) => ({ id: c.id, name: c.name, code: c.code })),
    categories: categories.map((c: CatRow) => ({ id: c.id, label: c.label })),
    inventory,
    totalAssets,
    assetsAssigned,
    assetsUnassigned,
    transfersThisMonth,
  }
}
