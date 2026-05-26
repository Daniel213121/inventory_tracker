'use server'

import { prisma }                    from '@/lib/db'
import { logAudit, getCurrentUser }  from '@/lib/audit'
import { revalidatePath }            from 'next/cache'
import type { Condition, MovementType, Prisma } from '@prisma/client'

// ─── Serializer ───────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeMovement(m: any) {
  return {
    id:                m.id,
    itemId:            m.itemId,
    itemName:          m.item?.name        ?? null,
    companyId:         m.companyId,
    companyCode:       m.company?.code     ?? null,
    companyLogoUrl:    m.company?.logoUrl  ?? null,
    type:              m.type,
    quantity:          m.quantity,
    serialsDispatched: m.serialsDispatched,
    condBefore:        m.condBefore        ?? null,
    condAfter:         m.condAfter         ?? null,
    suppliedTo:        m.suppliedTo,
    destinationCode:   m.destinationCode,
    driverName:        m.driverName,
    notes:             m.notes,
    waybillId:         m.waybillId,
    waybillNumber:     m.waybill?.number   ?? null,
    itemIsSerialised:  m.item?.isSerialised ?? false,
    movedBy:           m.movedBy,
    movedAt:           m.movedAt.toISOString(),
    createdAt:         m.createdAt.toISOString(),
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function listMovements(filters: {
  itemId?:    string
  companyId?: string
  type?:      string
  search?:    string
  page?:      number
  pageSize?:  number
} = {}) {
  const { itemId, companyId, type, search, page = 1, pageSize = 20 } = filters

  const where: Prisma.MovementWhereInput = {}
  if (itemId    )                         where.itemId    = itemId
  if (companyId && companyId !== 'all') where.companyId = companyId
  if (type      && type      !== 'all') where.type      = type as MovementType
  if (search) {
    where.OR = [
      { suppliedTo: { contains: search, mode: 'insensitive' } },
      { driverName: { contains: search, mode: 'insensitive' } },
      { item: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const [total, movements] = await Promise.all([
    prisma.movement.count({ where }),
    prisma.movement.findMany({
      where,
      include: { item: { include: { category: true } }, company: true, waybill: true },
      orderBy: { movedAt: 'desc' },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
    }),
  ])

  return { total, movements: movements.map(serializeMovement), page, pageSize }
}

export async function getMovement(id: string) {
  const m = await prisma.movement.findUnique({
    where:   { id },
    include: { item: { include: { category: true } }, waybill: true },
  })
  return m ? serializeMovement(m) : null
}

// ─── Dispatched items (items still out, grouped by waybill) ──────────────────

export async function listDispatchedItems(companyId: string) {
  const movements = await prisma.movement.findMany({
    where:   { companyId },
    include: { item: true, waybill: true, company: true },
    orderBy: { movedAt: 'asc' },
  })

  // For each item track the latest movement — if it's an OUT it's still dispatched
  const byItem = new Map<string, typeof movements[0]>()
  for (const m of movements) {
    if (m.type === 'OUT' && m.waybillId) byItem.set(m.itemId, m)
    else if (m.type === 'IN')            byItem.delete(m.itemId)
  }

  // Group by waybill
  const byWaybill = new Map<string, typeof movements>()
  for (const m of byItem.values()) {
    const key = m.waybillId!
    if (!byWaybill.has(key)) byWaybill.set(key, [])
    byWaybill.get(key)!.push(m)
  }

  return [...byWaybill.entries()]
    .map(([, mvs]) => ({
      waybillId:     mvs[0].waybillId!,
      waybillNumber: mvs[0].waybill?.number ?? mvs[0].waybillId!,
      suppliedTo:    mvs[0].suppliedTo,
      date:          mvs[0].movedAt.toISOString(),
      movements:     mvs.map(serializeMovement),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// ─── Stock In ─────────────────────────────────────────────────────────────────

export async function stockIn(data: {
  itemId:          string
  isSerialised:    boolean
  // Serialised path: one entry per returning unit with its individual condition
  serialReturns?:  { serial: string; condition: string }[]
  // Non-serialised path: qty + single condition
  quantity?:       number
  condAfter?:      string
  condBefore?:     string
  suppliedTo:      string
  driverName:      string
  notes?:          string
  date?:           string
}) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  const item = await prisma.inventoryItem.findUnique({ where: { id: data.itemId } })
  if (!item) throw new Error('Item not found')

  const movedAt = data.date ? new Date(data.date) : new Date()

  const movement = await prisma.$transaction(async tx => {
    if (data.isSerialised && data.serialReturns && data.serialReturns.length > 0) {
      // Update each SerialUnit: mark IN_STOCK with the returned condition
      await Promise.all(
        data.serialReturns.map(sr =>
          tx.serialUnit.update({
            where: { itemId_serial: { itemId: data.itemId, serial: sr.serial } },
            data:  { status: 'IN_STOCK', condition: sr.condition as Condition },
          })
        )
      )

      return tx.movement.create({
        data: {
          itemId:            data.itemId,
          companyId:         item.companyId,
          type:              'IN' as MovementType,
          quantity:          data.serialReturns.length,
          serialsDispatched: data.serialReturns.map(sr => sr.serial),
          condBefore:        null,
          condAfter:         null,
          suppliedTo:        data.suppliedTo,
          destinationCode:   null,
          driverName:        data.driverName,
          notes:             data.notes?.trim() || null,
          movedBy:           actor.name,
          movedAt,
        },
      })
    }

    if (!data.isSerialised && data.quantity && data.condAfter) {
      const cond      = data.condAfter as Condition
      const bucketKey = cond === 'NEW' ? 'qtyNew' : cond === 'USED' ? 'qtyUsed' : 'qtyFaulty'

      await tx.inventoryItem.update({
        where: { id: data.itemId },
        data:  { [bucketKey]: { increment: data.quantity } },
      })

      return tx.movement.create({
        data: {
          itemId:            data.itemId,
          companyId:         item.companyId,
          type:              'IN' as MovementType,
          quantity:          data.quantity,
          serialsDispatched: [],
          condBefore:        (data.condBefore ?? null) as Condition | null,
          condAfter:         cond,
          suppliedTo:        data.suppliedTo,
          destinationCode:   null,
          driverName:        data.driverName,
          notes:             data.notes?.trim() || null,
          movedBy:           actor.name,
          movedAt,
        },
      })
    }

    throw new Error('Invalid stock-in data: provide serialReturns or quantity+condAfter')
  })

  await logAudit({
    action:       'MOVEMENT_STOCK_IN',
    email:        actor.email,
    userId:       actor.id,
    resourceType: 'Movement',
    resourceId:   movement.id,
    metadata:     `stock-in ${movement.quantity}× ${item.name}`,
  })

  revalidatePath('/inventory')
  revalidatePath('/movements')
  return serializeMovement(movement)
}

// ─── Stock Out ────────────────────────────────────────────────────────────────

export async function stockOut(data: {
  companyId:       string
  lines:           Array<{
    itemId:          string
    qty:             number
    selectedSerials: string[]
    conditionFrom?:  string   // non-serialised: which condition bucket to draw from
  }>
  suppliedTo:       string
  destinationCode:  string
  deliveryLocation?: string
  driverName:       string
  carNumber?:       string
  notes?:           string
  date?:            string
}) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  const items = await prisma.inventoryItem.findMany({
    where: { id: { in: data.lines.map(l => l.itemId) } },
  })
  const itemMap = Object.fromEntries(items.map(i => [i.id, i]))

  // Validate availability before entering the transaction
  for (const line of data.lines) {
    const item = itemMap[line.itemId]
    if (!item) throw new Error(`Item ${line.itemId} not found`)

    if (item.isSerialised) {
      if (line.selectedSerials.length === 0) throw new Error(`No serials selected for "${item.name}"`)
    } else {
      const cond    = (line.conditionFrom ?? 'NEW') as Condition
      const avail   = cond === 'NEW' ? item.qtyNew : cond === 'USED' ? item.qtyUsed : item.qtyFaulty
      if (avail < line.qty) throw new Error(`Insufficient ${cond.toLowerCase()} stock for "${item.name}"`)
    }
  }

  const movedAt = data.date ? new Date(data.date) : new Date()

  const result = await prisma.$transaction(async tx => {
    // Atomically increment waybill sequence
    const company = await tx.company.update({
      where: { id: data.companyId },
      data:  { waybillSequence: { increment: 1 } },
    })

    const seq           = String(company.waybillSequence).padStart(2, '0')
    const year          = movedAt.getFullYear()
    const destCode      = data.destinationCode.toUpperCase()
    const waybillNumber = `${company.code}/${destCode}/${year}/${seq}`

    // Create one movement per line
    const movements = await Promise.all(
      data.lines.map(line => {
        const item        = itemMap[line.itemId]
        const condFrom    = item.isSerialised ? null : (line.conditionFrom ?? null) as Condition | null
        return tx.movement.create({
          data: {
            itemId:            line.itemId,
            companyId:         data.companyId,
            type:              'OUT' as MovementType,
            quantity:          line.qty,
            serialsDispatched: line.selectedSerials,
            condBefore:        condFrom,
            condAfter:         condFrom,
            suppliedTo:        data.suppliedTo,
            destinationCode:   data.destinationCode,
            driverName:        data.driverName,
            notes:             data.notes?.trim() || null,
            movedBy:           actor.name,
            movedAt,
          },
        })
      })
    )

    // Create the waybill
    const waybill = await tx.waybill.create({
      data: {
        number:           waybillNumber,
        companyId:        data.companyId,
        date:             movedAt,
        suppliedTo:       data.suppliedTo,
        destinationCode:  data.destinationCode,
        deliveryLocation: data.deliveryLocation?.trim() || null,
        driverName:       data.driverName,
        carNumber:        data.carNumber?.trim() || null,
        itemIds:          movements.map(m => m.id),
        generatedBy:      actor.name,
      },
    })

    // Back-link movements → waybill, then update inventory
    await Promise.all([
      ...movements.map(m =>
        tx.movement.update({ where: { id: m.id }, data: { waybillId: waybill.id } })
      ),
      ...data.lines.map(line => {
        const item = itemMap[line.itemId]
        if (item.isSerialised) {
          // Mark selected SerialUnits as DISPATCHED
          return tx.serialUnit.updateMany({
            where: { itemId: line.itemId, serial: { in: line.selectedSerials }, status: 'IN_STOCK' },
            data:  { status: 'DISPATCHED' },
          })
        } else {
          // Decrement the chosen condition bucket
          const cond      = (line.conditionFrom ?? 'NEW') as Condition
          const bucketKey = cond === 'NEW' ? 'qtyNew' : cond === 'USED' ? 'qtyUsed' : 'qtyFaulty'
          return tx.inventoryItem.update({
            where: { id: line.itemId },
            data:  { [bucketKey]: { decrement: line.qty } },
          })
        }
      }),
    ])

    return { waybill, movements }
  })

  await logAudit({
    action:       'MOVEMENT_STOCK_OUT',
    email:        actor.email,
    userId:       actor.id,
    resourceType: 'Waybill',
    resourceId:   result.waybill.id,
    metadata:     `stock-out ${data.lines.length} line(s) → ${data.suppliedTo} (${result.waybill.number})`,
  })

  revalidatePath('/inventory')
  revalidatePath('/movements')
  revalidatePath('/waybills')

  return {
    waybillId:     result.waybill.id,
    waybillNumber: result.waybill.number,
  }
}
