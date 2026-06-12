'use client'

import { useEffect, useState } from 'react'
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
  ASSET_TYPE_LABEL, ASSET_TYPE_ICON,
} from '../../lib/data'
import { listEmployees } from '../../app/actions/employees'
import { listCompanies, listBranches } from '../../app/actions/settings'
import type { AssetType, Employee, Company, Branch } from '../../lib/types'

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

// ─── Content ──────────────────────────────────────────────────────────────

function EmployeesContent() {
  const router = useRouter()

  const [q, setQ]           = useState('')
  const [company, setCompany] = useState('')
  const [branch, setBranch]   = useState('')
  const [dept, setDept]       = useState('')
  const [empStatus, setEmpStatus] = useState<'active' | 'resigned' | 'all'>('active')
  const [page, setPage]       = useState(1)

  const [loading, setLoading] = useState(true)
  const [paged, setPaged]     = useState<Employee[]>([])
  const [total, setTotal]     = useState(0)
  const [pages, setPages]     = useState(1)
  const [employeeCount, setEmployeeCount] = useState(0)
  const [active, setActive]   = useState(0)
  const [companies, setCompanies] = useState<Company[]>([])
  const [branches, setBranches]   = useState<Branch[]>([])
  const [departments, setDepartments] = useState<string[]>([])

  useEffect(() => { setBranch(''); setPage(1) }, [company])

  useEffect(() => {
    listCompanies().then(setCompanies)
    listEmployees({ pageSize: 1000 }).then(r => {
      setEmployeeCount(r.total)
      setActive((r.items as unknown as Employee[]).filter(e => e.active).length)
      setDepartments([...new Set((r.items as unknown as Employee[]).map(e => e.department))].sort())
    })
  }, [])

  useEffect(() => {
    listBranches(company || undefined).then(setBranches)
  }, [company])

  useEffect(() => {
    setLoading(true)
    listEmployees({
      companyId:  company || undefined,
      branchId:   branch  || undefined,
      department: dept    || undefined,
      active:     empStatus === 'all' ? undefined : empStatus === 'active',
      search:     q || undefined,
      page, pageSize: PAGE_SIZE,
    }).then(r => {
      setPaged(r.items as unknown as Employee[])
      setTotal(r.total)
      setPages(r.pages)
      setLoading(false)
    })
  }, [q, company, branch, dept, empStatus, page])

  function assetCountFor(e: Employee) {
    return ((e as unknown as { assetAssignments?: { returnedAt: string | null }[] }).assetAssignments ?? [])
      .filter(a => a.returnedAt == null).length
  }

  const availBranches = branches

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${employeeCount} employees · ${active} active across both companies`}
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
              {companies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
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
            {loading && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-2)' }}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading && paged.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-2)' }}>
                  No employees match your filters
                </td>
              </tr>
            )}
            {!loading && paged.map(e => {
              const co = (e as unknown as { company?: Company }).company ?? companies.find(c => c.id === e.companyId)
              const branchName = (e as unknown as { branch?: Branch }).branch?.name
                ?? branches.find(b => b.id === e.branchId)?.name ?? ''
              const assetCount = assetCountFor(e)
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
                  <td>{co && <CompanyChip code={co.code} name={co.name} logoUrl={co.logoUrl} />}</td>
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
                        onClick={() => router.push(`/employees/${e.id}/edit`)}>
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
