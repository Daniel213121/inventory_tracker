'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell }    from '../../components/layout/AppShell'
import { PageHeader }  from '../../components/ui/PageHeader'
import { SearchBar }   from '../../components/ui/SearchBar'
import { KindBadge, StatusBadge } from '../../components/ui/badges'
import { CompanyChip } from '../../components/ui/CompanyChip'
import { Icon }        from '../../components/icons/Icon'
import { Loading }     from '../../components/ui/Loading'
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from '../../components/ui/pagination'
import {
  EMPLOYEES, BRANCHES, BRANCH_BY_ID, EMPLOYEE_BY_ID,
  COMPANIES, COMPANY_BY_ID,
  ASSET_ASSIGNMENTS,
  ASSET_TYPE_LABEL, ASSET_TYPE_ICON,
} from '../../lib/data'
import type { AssetType } from '../../lib/types'

const PAGE_SIZE = 12

// ─── Local helpers ────────────────────────────────────────────────────────

function TypeChip({ type }: { type: AssetType }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 12, fontWeight: 500,
      padding: '3px 9px', background: 'var(--bg)',
      border: '1px solid var(--border)', borderRadius: 999,
    }}>
      <Icon name={ASSET_TYPE_ICON[type] as never} size={12} stroke="var(--text-2)" />
      {ASSET_TYPE_LABEL[type]}
    </span>
  )
}

function NameAvatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

function branchesFor(companyId: string) {
  return companyId ? BRANCHES.filter(b => b.companyId === companyId) : BRANCHES
}

// ─── Content ──────────────────────────────────────────────────────────────

function EmployeesContent() {
  const router = useRouter()

  const [q, setQ]           = useState('')
  const [company, setCompany] = useState('')
  const [branch, setBranch]   = useState('')
  const [dept, setDept]       = useState('')
  const [empStatus, setEmpStatus] = useState<'active' | 'resigned' | 'all'>('active')
  const [page, setPage]       = useState(1)

  useEffect(() => { setBranch(''); setPage(1) }, [company])

  const departments = useMemo(() =>
    [...new Set(EMPLOYEES.map(e => e.department))].sort(),
  [])

  const filtered = useMemo(() => {
    const lq = q.toLowerCase()
    return EMPLOYEES.filter(e => {
      if (company && e.companyId !== company) return false
      if (branch  && e.branchId  !== branch)  return false
      if (dept    && e.department !== dept)    return false
      if (empStatus === 'active'  && !e.active) return false
      if (empStatus === 'resigned' &&  e.active) return false
      if (q) {
        const hay = [e.name, e.jobTitle, e.department, e.employeeId ?? ''].join(' ').toLowerCase()
        if (!hay.includes(lq)) return false
      }
      return true
    })
  }, [q, company, branch, dept, empStatus])

  const total  = filtered.length
  const active = EMPLOYEES.filter(e => e.active).length
  const pages  = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const paged  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const availBranches = branchesFor(company)

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${EMPLOYEES.length} employees · ${active} active across both companies`}
        actions={
          <>
            <button className="btn btn-secondary btn-sm row gap-2">
              <Icon name="download" size={14} />Export
            </button>
            <button className="btn btn-primary btn-sm row gap-2"
              onClick={() => router.push('/employees/add')}>
              <Icon name="plus" size={14} />Add Employee
            </button>
          </>
        }
      />

      {/* Filter bar */}
      <div className="card" style={{ padding: 16, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
          <SearchBar value={q} onChange={v => { setQ(v); setPage(1) }} width={380}
            placeholder="Search name, job title, department, ID…" />
          <div className="row gap-2" style={{ marginLeft: 'auto' }}>
            <select className="select" style={{ width: 150 }}
              value={company} onChange={e => { setCompany(e.target.value); setPage(1) }}>
              <option value="">All companies</option>
              {COMPANIES.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
            </select>
            <select className="select" style={{ width: 150 }}
              value={branch} onChange={e => { setBranch(e.target.value); setPage(1) }}>
              <option value="">All branches</option>
              {availBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select className="select" style={{ width: 180 }}
              value={dept} onChange={e => { setDept(e.target.value); setPage(1) }}>
              <option value="">All departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="select" style={{ width: 140 }}
              value={empStatus}
              onChange={e => { setEmpStatus(e.target.value as 'active' | 'resigned' | 'all'); setPage(1) }}>
              <option value="active">Active</option>
              <option value="resigned">Resigned</option>
              <option value="all">All statuses</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Name</th>
              <th>Job Title</th>
              <th>Department</th>
              <th>Company</th>
              <th>Branch</th>
              <th>Status</th>
              <th>Assets</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-2)' }}>
                  No employees match your filters
                </td>
              </tr>
            )}
            {paged.map(e => {
              const co = COMPANY_BY_ID[e.companyId]
              const branchName = BRANCH_BY_ID[e.branchId]?.name ?? ''
              const assetCount = ASSET_ASSIGNMENTS.filter(
                a => a.employeeId === e.id && a.returnedAt == null
              ).length
              return (
                <tr key={e.id} onClick={() => router.push(`/employees/${e.id}`)}
                  style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="row gap-3">
                      <NameAvatar name={e.name} size={32} />
                      <div className="col">
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{e.name}</div>
                        <div className="t-mono muted" style={{ fontSize: 11 }}>
                          {e.employeeId || '—'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{e.jobTitle}</td>
                  <td style={{ fontSize: 13 }}>{e.department}</td>
                  <td>{co && <CompanyChip code={co.code} name={co.name} />}</td>
                  <td className="muted" style={{ fontSize: 13 }}>{branchName}</td>
                  <td><StatusBadge active={e.active} /></td>
                  <td>
                    {assetCount > 0
                      ? <KindBadge kind="out">{assetCount} {assetCount === 1 ? 'asset' : 'assets'}</KindBadge>
                      : <KindBadge kind="inactive">None</KindBadge>}
                  </td>
                  <td onClick={ev => ev.stopPropagation()}>
                    <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm"
                        onClick={() => router.push(`/employees/${e.id}`)}>
                        <Icon name="eye" size={14} />
                      </button>
                      <button className="btn btn-ghost btn-sm">
                        <Icon name="edit" size={14} />
                      </button>
                      {e.active && (
                        <button className="btn btn-secondary btn-sm"
                          onClick={() => router.push(`/assets/assign?employee=${e.id}`)}>
                          Assign asset
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {total > PAGE_SIZE && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="muted" style={{ fontSize: 13 }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </span>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))}
                      aria-disabled={page === 1}
                      className={page === 1 ? 'pointer-events-none opacity-50' : ''} />
                  </PaginationItem>
                  {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(n => (
                    <PaginationItem key={n}>
                      <PaginationLink isActive={n === page} onClick={() => setPage(n)}>{n}</PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext onClick={() => setPage(p => Math.min(pages, p + 1))}
                      aria-disabled={page === pages}
                      className={page === pages ? 'pointer-events-none opacity-50' : ''} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function EmployeesPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('auth_user')
    if (!stored) { router.push('/login'); return }
    setUser(JSON.parse(stored))
  }, [router])

  if (!user) return <Loading />

  return (
    <AppShell user={user} onLogout={() => { localStorage.removeItem('auth_user'); router.push('/login') }}>
      <EmployeesContent />
    </AppShell>
  )
}
