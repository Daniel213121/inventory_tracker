'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell }    from '../../components/layout/AppShell'
import { PageHeader }  from '../../components/ui/PageHeader'
import { SearchBar }   from '../../components/ui/SearchBar'
import { KindBadge }   from '../../components/ui/badges'
import { CompanyChip } from '../../components/ui/CompanyChip'
import { Icon }        from '../../components/icons/Icon'
import { Loading }     from '../../components/ui/Loading'
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from '../../components/ui/pagination'
import {
  ASSETS, BRANCHES, EMPLOYEES,
  ASSET_ASSIGNMENTS, BRANCH_BY_ID, EMPLOYEE_BY_ID,
  COMPANIES, COMPANY_BY_ID,
  ASSET_TYPE_LABEL, ASSET_TYPE_ICON,
  ASSET_STATUS_LABEL, ASSET_CONDITION_LABEL,
} from '../../lib/data'
import type { AssetType, AssetStatus, AssetCondition } from '../../lib/types'

const PAGE_SIZE = 12

// ─── Local helpers ────────────────────────────────────────────────────────

function TypeChip({ type }: { type: AssetType }) {
  return (
    <span className="row" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 12, fontWeight: 500,
      padding: '3px 9px',
      background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 999,
    }}>
      <Icon name={ASSET_TYPE_ICON[type] as never} size={12} stroke="var(--text-2)" />
      {ASSET_TYPE_LABEL[type]}
    </span>
  )
}

function AssetStatusBadge({ value }: { value: AssetStatus }) {
  const map: Record<AssetStatus, string> = {
    AVAILABLE: 'active', ASSIGNED: 'out', UNDER_REPAIR: 'used', RETIRED: 'inactive',
  }
  return <KindBadge kind={map[value]}>{ASSET_STATUS_LABEL[value]}</KindBadge>
}

function currentEmployeeFor(assetId: string) {
  return ASSET_ASSIGNMENTS.find(a => a.assetId === assetId && a.returnedAt == null)
}

function branchesFor(companyId: string) {
  return companyId ? BRANCHES.filter(b => b.companyId === companyId) : BRANCHES
}

// ─── Content ──────────────────────────────────────────────────────────────

function AssetsContent() {
  const router = useRouter()

  const [q, setQ]                   = useState('')
  const [company, setCompany]       = useState('')
  const [branch, setBranch]         = useState('')
  const [type, setType]             = useState('')
  const [status, setStatus]         = useState('')
  const [page, setPage]             = useState(1)

  useEffect(() => { setBranch(''); setPage(1) }, [company])

  const filtered = useMemo(() => {
    const lq = q.toLowerCase()
    return ASSETS.filter(a => {
      if (company && a.companyId !== company) return false
      if (branch  && a.branchId  !== branch)  return false
      if (type    && a.type      !== type)     return false
      if (status  && a.status    !== status)   return false
      if (q) {
        const cur   = currentEmployeeFor(a.id)
        const emp   = cur ? EMPLOYEE_BY_ID[cur.employeeId] : null
        const haystack = [a.assetTag, a.brand, a.model, a.serial, emp?.name ?? ''].join(' ').toLowerCase()
        if (!haystack.includes(lq)) return false
      }
      return true
    })
  }, [q, company, branch, type, status])

  const total  = filtered.length
  const pages  = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const paged  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const assigned  = ASSETS.filter(a => a.status === 'ASSIGNED').length
  const available = ASSETS.filter(a => a.status === 'AVAILABLE').length

  const availBranches = branchesFor(company)

  return (
    <div>
      <PageHeader
        title="Assets"
        subtitle={`${total} assets · ${assigned} assigned · ${available} available`}
        actions={
          <>
            <button className="btn btn-secondary btn-sm row gap-2">
              <Icon name="download" size={14} />Export
            </button>
            <button
              className="btn btn-primary btn-sm row gap-2"
              onClick={() => router.push('/assets/add')}
            >
              <Icon name="plus" size={14} />Add New Asset
            </button>
          </>
        }
      />

      {/* Filter bar */}
      <div className="card" style={{ padding: 16, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <div className="row gap-3" style={{ flexWrap: 'wrap' }}>
          <SearchBar value={q} onChange={v => { setQ(v); setPage(1) }} width={380}
            placeholder="Search tag, brand, model, serial, employee…" />
          <div className="row gap-2" style={{ marginLeft: 'auto' }}>
            <select className="select" style={{ width: 160 }}
              value={company} onChange={e => { setCompany(e.target.value); setPage(1) }}>
              <option value="">All companies</option>
              {COMPANIES.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
            </select>
            <select className="select" style={{ width: 160 }}
              value={branch} onChange={e => { setBranch(e.target.value); setPage(1) }}>
              <option value="">All branches</option>
              {availBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select className="select" style={{ width: 130 }}
              value={type} onChange={e => { setType(e.target.value); setPage(1) }}>
              <option value="">All types</option>
              {(Object.entries(ASSET_TYPE_LABEL) as [AssetType, string][]).map(([v, l]) =>
                <option key={v} value={v}>{l}</option>)}
            </select>
            <select className="select" style={{ width: 140 }}
              value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
              <option value="">All statuses</option>
              {(Object.entries(ASSET_STATUS_LABEL) as [AssetStatus, string][]).map(([v, l]) =>
                <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Type</th>
              <th>Brand / Model</th>
              <th>Serial</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Company</th>
              <th>Branch</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-2)' }}>
                  No assets match your filters
                </td>
              </tr>
            )}
            {paged.map(a => {
              const cur = currentEmployeeFor(a.id)
              const emp = cur ? EMPLOYEE_BY_ID[cur.employeeId] : null
              const co  = COMPANY_BY_ID[a.companyId]
              const branchName = BRANCH_BY_ID[a.branchId]?.name ?? ''
              const shortBranch = branchName.replace(/^(VSA|VIA)\s*[—-]\s*/i, '')
              return (
                <tr key={a.id} onClick={() => router.push(`/assets/${a.id}`)}
                  style={{ cursor: 'pointer' }}>
                  <td>
                    <span className="t-mono" style={{ fontWeight: 600, color: 'var(--secondary)' }}>
                      {a.assetTag}
                    </span>
                  </td>
                  <td><TypeChip type={a.type} /></td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{a.brand}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{a.model}</div>
                  </td>
                  <td><span className="t-mono" style={{ fontSize: 13 }}>{a.serial}</span></td>
                  <td><AssetStatusBadge value={a.status} /></td>
                  <td>
                    {emp
                      ? <span style={{ fontWeight: 500, fontSize: 13 }}>{emp.name}</span>
                      : <span className="muted">—</span>}
                  </td>
                  <td>
                    {co && <CompanyChip code={co.code} name={co.name} />}
                  </td>
                  <td><span className="muted" style={{ fontSize: 13 }}>{shortBranch}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm"
                        onClick={() => router.push(`/assets/${a.id}`)}>
                        <Icon name="eye" size={14} />
                      </button>
                      <button className="btn btn-ghost btn-sm"
                        onClick={() => router.push(`/assets/${a.id}/edit`)}>
                        <Icon name="edit" size={14} />
                      </button>
                      {a.status === 'AVAILABLE' && (
                        <button className="btn btn-primary btn-sm"
                          onClick={() => router.push(`/assets/assign?asset=${a.id}`)}>
                          Assign
                        </button>
                      )}
                      {a.status === 'ASSIGNED' && (
                        <button className="btn btn-secondary btn-sm"
                          onClick={() => router.push(`/assets/transfer?asset=${a.id}`)}>
                          Transfer
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

export default function AssetsPage() {
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
      <AssetsContent />
    </AppShell>
  )
}
