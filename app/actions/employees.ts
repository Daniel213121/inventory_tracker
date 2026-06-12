'use server'

import { prisma }                    from '@/lib/db'
import { logAudit, getCurrentUser }  from '@/lib/audit'
import { revalidatePath }            from 'next/cache'
import type { Prisma } from '@prisma/client'

// ─── Serializer ───────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeEmployee(e: any) {
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
    joinedAt:   e.joinedAt.toISOString().slice(0, 10),
    resignedAt: e.resignedAt ? e.resignedAt.toISOString().slice(0, 10) : null,
    active:     e.active,
    createdAt:  e.createdAt.toISOString(),
    updatedAt:  e.updatedAt.toISOString(),
    ...(e.company && {
      company: { id: e.company.id, name: e.company.name, code: e.company.code, logoUrl: e.company.logoUrl ?? null },
    }),
    ...(e.branch && {
      branch: {
        id: e.branch.id, companyId: e.branch.companyId, name: e.branch.name,
        createdAt: e.branch.createdAt.toISOString(),
      },
    }),
    ...(e.assetAssignments && {
      assetAssignments: e.assetAssignments.map(serializeAssignment),
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
    ...(a.asset && {
      asset: {
        id:              a.asset.id,
        companyId:       a.asset.companyId,
        branchId:        a.asset.branchId,
        assetTag:        a.asset.assetTag,
        type:            a.asset.type,
        brand:           a.asset.brand,
        model:           a.asset.model,
        serial:          a.asset.serial,
        processor:       a.asset.processor       ?? undefined,
        ram:             a.asset.ram             ?? undefined,
        storage:         a.asset.storage         ?? undefined,
        operatingSystem: a.asset.operatingSystem ?? undefined,
        software:        a.asset.software ?? [],
        purchaseDate:    a.asset.purchaseDate instanceof Date ? a.asset.purchaseDate.toISOString().slice(0, 10) : undefined,
        purchasePrice:   a.asset.purchasePrice != null ? Number(a.asset.purchasePrice) : undefined,
        warrantyExpiry:  a.asset.warrantyExpiry instanceof Date ? a.asset.warrantyExpiry.toISOString().slice(0, 10) : undefined,
        condition:       a.asset.condition,
        status:          a.asset.status,
        notes:           a.asset.notes ?? undefined,
        createdAt:       a.asset.createdAt.toISOString(),
        updatedAt:       a.asset.updatedAt.toISOString(),
      },
    }),
  }
}

const EMPLOYEE_INCLUDE = { company: true, branch: true } as const

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function listEmployees(filters: {
  companyId?:  string
  branchId?:   string
  department?: string
  active?:     boolean
  search?:     string
  page?:       number
  pageSize?:   number
} = {}) {
  const { companyId, branchId, department, active, search, page = 1, pageSize = 10 } = filters

  const and: Prisma.EmployeeWhereInput[] = []

  if (companyId  && companyId  !== 'all') and.push({ companyId })
  if (branchId   && branchId   !== 'all') and.push({ branchId })
  if (department && department !== 'all') and.push({ department })
  if (active !== undefined) and.push({ active })

  if (search) {
    and.push({
      OR: [
        { name:       { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { email:      { contains: search, mode: 'insensitive' } },
        { jobTitle:    { contains: search, mode: 'insensitive' } },
      ],
    })
  }

  const where: Prisma.EmployeeWhereInput = and.length > 0 ? { AND: and } : {}

  const [total, employees] = await Promise.all([
    prisma.employee.count({ where }),
    prisma.employee.findMany({
      where,
      include: { ...EMPLOYEE_INCLUDE, assetAssignments: true },
      orderBy: { name: 'asc' },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
    }),
  ])

  return {
    total,
    items: employees.map(serializeEmployee),
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function getEmployee(id: string) {
  const employee = await prisma.employee.findUnique({
    where:   { id },
    include: {
      company: true,
      branch:  true,
      assetAssignments: {
        include: { asset: true },
        orderBy: { assignedAt: 'desc' },
      },
    },
  })
  return employee ? serializeEmployee(employee) : null
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createEmployee(data: {
  companyId:  string
  branchId:   string
  employeeId?: string
  name:       string
  jobTitle:   string
  department: string
  email?:     string
  phone?:     string
  joinedAt:   string
  active?:    boolean
}) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  let employee
  try {
    employee = await prisma.employee.create({
      data: {
        companyId:  data.companyId,
        branchId:   data.branchId,
        employeeId: data.employeeId?.trim() || null,
        name:       data.name.trim(),
        jobTitle:   data.jobTitle.trim(),
        department: data.department.trim(),
        email:      data.email?.trim() || null,
        phone:      data.phone?.trim() || null,
        joinedAt:   new Date(data.joinedAt),
        active:     data.active ?? true,
      },
      include: EMPLOYEE_INCLUDE,
    })
  } catch (err) {
    if (err instanceof Error && 'code' in err && (err as { code?: string }).code === 'P2002') {
      throw new Error('An employee with this employee ID already exists')
    }
    throw err
  }

  await logAudit({
    action:       'EMPLOYEE_CREATED',
    email:        actor.email,
    userId:       actor.id,
    resourceType: 'Employee',
    resourceId:   employee.id,
    metadata:     `created ${employee.name}`,
  })

  revalidatePath('/employees')
  return serializeEmployee(employee)
}

export async function updateEmployee(id: string, data: {
  companyId?:  string
  branchId?:   string
  employeeId?: string | null
  name?:       string
  jobTitle?:   string
  department?: string
  email?:      string | null
  phone?:      string | null
  joinedAt?:   string
  active?:     boolean
}) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  let employee
  try {
    employee = await prisma.employee.update({
      where: { id },
      data: {
        ...(data.companyId  !== undefined && { companyId:  data.companyId }),
        ...(data.branchId   !== undefined && { branchId:   data.branchId }),
        ...(data.employeeId !== undefined && { employeeId: data.employeeId?.trim() || null }),
        ...(data.name       !== undefined && { name:       data.name.trim() }),
        ...(data.jobTitle   !== undefined && { jobTitle:   data.jobTitle.trim() }),
        ...(data.department !== undefined && { department: data.department.trim() }),
        ...(data.email      !== undefined && { email:      data.email?.trim() || null }),
        ...(data.phone      !== undefined && { phone:      data.phone?.trim() || null }),
        ...(data.joinedAt   !== undefined && { joinedAt:   new Date(data.joinedAt) }),
        ...(data.active     !== undefined && { active:     data.active }),
      },
      include: EMPLOYEE_INCLUDE,
    })
  } catch (err) {
    if (err instanceof Error && 'code' in err && (err as { code?: string }).code === 'P2002') {
      throw new Error('An employee with this employee ID already exists')
    }
    throw err
  }

  revalidatePath('/employees')
  revalidatePath(`/employees/${id}`)
  return serializeEmployee(employee)
}

export async function resignEmployee(id: string, data: { resignedAt: string }) {
  const actor = await getCurrentUser()
  if (!actor) throw new Error('Unauthorized')

  const employee = await prisma.employee.update({
    where: { id },
    data:  {
      resignedAt: new Date(data.resignedAt),
      active:     false,
    },
    include: EMPLOYEE_INCLUDE,
  })

  await logAudit({
    action:       'EMPLOYEE_RESIGNED',
    email:        actor.email,
    userId:       actor.id,
    resourceType: 'Employee',
    resourceId:   employee.id,
    metadata:     `recorded resignation for ${employee.name}`,
  })

  revalidatePath('/employees')
  revalidatePath(`/employees/${id}`)
  return serializeEmployee(employee)
}
