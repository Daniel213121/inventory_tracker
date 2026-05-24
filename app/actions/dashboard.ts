'use server'

import { prisma } from '@/lib/db'

export type DashboardMovement = {
  id:          string
  itemId:      string
  itemName:    string
  companyId:   string
  companyCode: string
  companyName: string
  type:        'IN' | 'OUT'
  quantity:    number
  movedBy:     string
  movedAt:     string
}

export type DashboardInventorySummary = {
  companyId:  string
  categoryId: string
  quantity:   number
}

export type DashboardData = {
  totalItems:      number
  itemsOut:        number
  waybillCount:    number
  recentMovements: DashboardMovement[]
  companies:       { id: string; name: string; code: string }[]
  categories:      { id: string; label: string }[]
  inventory:       DashboardInventorySummary[]
}

export async function getDashboardData(): Promise<DashboardData> {
  const [inventoryItems, allMovements, waybillCount, companies, categories] = await Promise.all([
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
      include: { item: { select: { name: true } }, company: { select: { code: true, name: true } } },
      orderBy: { movedAt: 'asc' },
    }),

    prisma.waybill.count(),

    prisma.company.findMany({ orderBy: { name: 'asc' } }),

    prisma.category.findMany({ orderBy: { label: 'asc' } }),
  ])

  // Compute currently dispatched items (last movement per item is OUT)
  const byItem = new Map<string, typeof allMovements[0]>()
  for (const m of allMovements) {
    if (m.type === 'OUT' && m.waybillId) byItem.set(m.itemId, m)
    else if (m.type === 'IN')            byItem.delete(m.itemId)
  }
  const itemsOut = [...byItem.values()].reduce((s, m) => s + m.quantity, 0)

  const totalItems = inventoryItems.reduce<number>((s, item) => {
    const qty = item.isSerialised
      ? item._count.serialUnits
      : item.qtyNew + item.qtyUsed + item.qtyFaulty
    return s + qty
  }, 0)

  const recentMovements = [...allMovements]
    .sort((a, b) => b.movedAt.getTime() - a.movedAt.getTime())
    .slice(0, 10)
    .map(m => ({
      id:          m.id,
      itemId:      m.itemId,
      itemName:    m.item.name,
      companyId:   m.companyId,
      companyCode: m.company.code,
      companyName: m.company.name,
      type:        m.type as 'IN' | 'OUT',
      quantity:    m.quantity,
      movedBy:     m.movedBy,
      movedAt:     m.movedAt.toISOString(),
    }))

  const inventory: DashboardInventorySummary[] = inventoryItems.map(item => ({
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
    companies: companies.map(c => ({ id: c.id, name: c.name, code: c.code })),
    categories: categories.map(c => ({ id: c.id, label: c.label })),
    inventory,
  }
}
