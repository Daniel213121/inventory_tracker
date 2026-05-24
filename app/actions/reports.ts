'use server'

import { prisma } from '@/lib/db'

// ─── Shared types ─────────────────────────────────────────────────────────────

export type ReportCompany = {
  id:   string
  name: string
  code: string
}

export type ReportCategory = {
  id:    string
  label: string
}

export type ReportInventoryItem = {
  id:            string
  name:          string
  companyId:     string
  companyCode:   string
  companyName:   string
  categoryId:    string
  categoryLabel: string
  qtyNew:        number
  qtyUsed:       number
  qtyFaulty:     number
  quantity:      number
  threshold:     number
}

export type ReportMovement = {
  id:          string
  itemName:    string
  companyId:   string
  companyCode: string
  companyName: string
  type:        'IN' | 'OUT'
  quantity:    number
  suppliedTo:  string
  movedBy:     string
  movedAt:     string
}

export type ReportDispatched = {
  id:                string
  itemName:          string
  companyId:         string
  companyCode:       string
  companyName:       string
  quantity:          number
  serialsDispatched: string[]
  suppliedTo:        string
  movedAt:           string
}

export type ReportWaybill = {
  id:          string
  number:      string
  companyId:   string
  companyCode: string
  companyName: string
  date:        string
  suppliedTo:  string
  driverName:  string
  generatedBy: string
}

export type ReportData = {
  companies:  ReportCompany[]
  categories: ReportCategory[]
  inventory:  ReportInventoryItem[]
  movements:  ReportMovement[]
  dispatched: ReportDispatched[]
  waybills:   ReportWaybill[]
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function getReportData(filters: {
  companyId?: string   // real DB id or 'all'
  from:       string   // YYYY-MM-DD
  to:         string   // YYYY-MM-DD
}): Promise<ReportData> {
  const { companyId, from, to } = filters
  const companyWhere = companyId && companyId !== 'all' ? { companyId } : {}

  const fromDate = new Date(from)
  const toDate   = new Date(to + 'T23:59:59')

  const [companies, categories, inventory, periodMovements, allMovements, waybills] = await Promise.all([
    prisma.company.findMany({ orderBy: { name: 'asc' } }),

    prisma.category.findMany({ orderBy: { label: 'asc' } }),

    // All inventory items (optionally filtered by company), with in-stock serials
    prisma.inventoryItem.findMany({
      where:   { ...companyWhere },
      include: {
        category: true,
        company:  true,
        serialUnits: { where: { status: 'IN_STOCK' } },
      },
      orderBy: { updatedAt: 'desc' },
    }),

    // Movements within the selected date range (for chart + table)
    prisma.movement.findMany({
      where:   { ...companyWhere, movedAt: { gte: fromDate, lte: toDate } },
      include: { item: true, company: true },
      orderBy: { movedAt: 'desc' },
    }),

    // All movements ever (for computing what's currently dispatched)
    prisma.movement.findMany({
      where:   { ...companyWhere },
      include: { item: true, company: true },
      orderBy: { movedAt: 'asc' },
    }),

    // Recent waybills
    prisma.waybill.findMany({
      where:   { ...companyWhere },
      include: { company: true },
      orderBy: { date: 'desc' },
      take:    10,
    }),
  ])

  // Compute "items currently dispatched" — last movement per item is OUT
  const byItem = new Map<string, typeof allMovements[0]>()
  for (const m of allMovements) {
    if (m.type === 'OUT' && m.waybillId) byItem.set(m.itemId, m)
    else if (m.type === 'IN')            byItem.delete(m.itemId)
  }
  const dispatched = [...byItem.values()]

  return {
    companies: companies.map(c => ({ id: c.id, name: c.name, code: c.code })),

    categories: categories.map(c => ({ id: c.id, label: c.label })),

    inventory: inventory.map(item => {
      const units = item.serialUnits
      const qtyNew    = item.isSerialised ? units.filter(u => u.condition === 'NEW').length    : item.qtyNew
      const qtyUsed   = item.isSerialised ? units.filter(u => u.condition === 'USED').length   : item.qtyUsed
      const qtyFaulty = item.isSerialised ? units.filter(u => u.condition === 'FAULTY').length : item.qtyFaulty
      return {
        id:            item.id,
        name:          item.name,
        companyId:     item.companyId,
        companyCode:   item.company.code,
        companyName:   item.company.name,
        categoryId:    item.categoryId,
        categoryLabel: item.category.label,
        qtyNew, qtyUsed, qtyFaulty,
        quantity:      item.isSerialised ? units.length : qtyNew + qtyUsed + qtyFaulty,
        threshold:     item.threshold,
      }
    }),

    movements: periodMovements.map(m => ({
      id:          m.id,
      itemName:    m.item.name,
      companyId:   m.companyId,
      companyCode: m.company.code,
      companyName: m.company.name,
      type:        m.type as 'IN' | 'OUT',
      quantity:    m.quantity,
      suppliedTo:  m.suppliedTo,
      movedBy:     m.movedBy,
      movedAt:     m.movedAt.toISOString(),
    })),

    dispatched: dispatched.map(m => ({
      id:                m.id,
      itemName:          m.item.name,
      companyId:         m.companyId,
      companyCode:       m.company.code,
      companyName:       m.company.name,
      quantity:          m.quantity,
      serialsDispatched: m.serialsDispatched,
      suppliedTo:        m.suppliedTo,
      movedAt:           m.movedAt.toISOString(),
    })),

    waybills: waybills.map(w => ({
      id:          w.id,
      number:      w.number,
      companyId:   w.companyId,
      companyCode: w.company.code,
      companyName: w.company.name,
      date:        w.date.toISOString().slice(0, 10),
      suppliedTo:  w.suppliedTo,
      driverName:  w.driverName,
      generatedBy: w.generatedBy,
    })),
  }
}
