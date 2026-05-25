'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AppShell }     from '../../../components/layout/AppShell'
import { PageHeader }   from '../../../components/ui/PageHeader'
import { SectionTitle } from '../../../components/ui/SectionTitle'
import { EmptyState }   from '../../../components/ui/EmptyState'
import { KindBadge }    from '../../../components/ui/badges'
import { CompanyChip }  from '../../../components/ui/CompanyChip'
import { Icon }         from '../../../components/icons/Icon'
import { Loading }      from '../../../components/ui/Loading'
import { fmtDate }      from '../../../lib/utils'
import {
  ASSETS, ASSET_BY_ID, BRANCHES, BRANCH_BY_ID,
  EMPLOYEES, EMPLOYEE_BY_ID,
  ASSET_ASSIGNMENTS, COMPANY_BY_ID,
  ASSET_TYPE_LABEL, ASSET_TYPE_ICON,
  ASSET_STATUS_LABEL, ASSET_CONDITION_LABEL,
  fmtCurrency, daysBetween,
} from '../../../lib/data'
import type { AssetType, AssetStatus, AssetCondition } from '../../../lib/types'

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

function SoftwareChip({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', fontSize: 12,
      padding: '3px 10px', background: 'var(--bg)',
      border: '1px solid var(--border)', borderRadius: 999,
    }}>
      {label}
    </span>
  )
}

function AssetStatusBadge({ value }: { value: AssetStatus }) {
  const map: Record<AssetStatus, string> = {
    AVAILABLE: 'active', ASSIGNED: 'out', UNDER_REPAIR: 'used', RETIRED: 'inactive',
  }
  return <KindBadge kind={map[value]}>{ASSET_STATUS_LABEL[value]}</KindBadge>
}

function AssetConditionBadge({ value }: { value: AssetCondition }) {
  const map: Record<AssetCondition, string> = {
    NEW: 'new', GOOD: 'active', FAIR: 'used', DAMAGED: 'faulty', BEYOND_REPAIR: 'faulty',
  }
  return <KindBadge kind={map[value]}>{ASSET_CONDITION_LABEL[value]}</KindBadge>
}

function KV({ label, children, mono, span }: {
  label: string; children: React.ReactNode; mono?: boolean; span?: number
}) {
  return (
    <div style={{ gridColumn: `span ${span ?? 1}`, minWidth: 0 }}>
      <div className="t-label" style={{ fontSize: 11, marginBottom: 4 }}>{label}</div>
      <div className={mono ? 't-mono' : ''} style={{ fontSize: 14, color: 'var(--text)' }}>
        {children ?? <span className="muted">—</span>}
      </div>
    </div>
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

function currentEmployeeFor(assetId: string) {
  return ASSET_ASSIGNMENTS.find(a => a.assetId === assetId && a.returnedAt == null)
}

function historyFor(assetId: string) {
  return ASSET_ASSIGNMENTS
    .filter(a => a.assetId === assetId)
    .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt))
}

// ─── Content ──────────────────────────────────────────────────────────────

function AssetDetailContent({ id }: { id: string }) {
  const router = useRouter()
  const asset  = ASSET_BY_ID[id] ?? ASSETS[0]
  const co     = COMPANY_BY_ID[asset.companyId]
  const cur    = currentEmployeeFor(asset.id)
  const emp    = cur ? EMPLOYEE_BY_ID[cur.employeeId] : null
  const history = historyFor(asset.id)

  const specs = [asset.processor, asset.ram, asset.storage, asset.operatingSystem].filter(Boolean)

  return (
    <div>
      <PageHeader
        title={`${asset.brand} ${asset.model}`}
        breadcrumb={
          <>
            <button className="btn btn-ghost btn-sm" style={{ padding: 0 }}
              onClick={() => router.push('/assets')}>Assets</button>
            <Icon name="chevronRight" size={14} stroke="var(--text-2)" />
            <span className="t-mono">{asset.assetTag}</span>
          </>
        }
        actions={
          <>
            <button className="btn btn-secondary btn-sm row gap-2"
              onClick={() => router.push(`/assets/${id}/edit`)}>
              <Icon name="edit" size={14} />Edit
            </button>
            {asset.status === 'AVAILABLE' && (
              <button className="btn btn-primary btn-sm row gap-2"
                onClick={() => router.push(`/assets/assign?asset=${id}`)}>
                <Icon name="plus" size={14} />Assign
              </button>
            )}
            {asset.status === 'ASSIGNED' && (
              <button className="btn btn-primary btn-sm row gap-2"
                onClick={() => router.push(`/assets/transfer?asset=${id}`)}>
                <Icon name="swap" size={14} />Transfer
              </button>
            )}
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Left — Asset details */}
        <div className="card" style={{ padding: 24 }}>
          <SectionTitle>Asset details</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, rowGap: 24 }}>
            <KV label="Company">
              {co && <CompanyChip code={co.code} name={co.name} />}
            </KV>
            <KV label="Branch">{BRANCH_BY_ID[asset.branchId]?.name}</KV>
            <KV label="Type"><TypeChip type={asset.type} /></KV>
            <KV label="Asset Tag" mono>{asset.assetTag}</KV>
            <KV label="Brand">{asset.brand}</KV>
            <KV label="Model">{asset.model}</KV>
            <KV label="Serial" mono>{asset.serial}</KV>
            <KV label="Condition"><AssetConditionBadge value={asset.condition} /></KV>
            <KV label="Status"><AssetStatusBadge value={asset.status} /></KV>
            <KV label="Purchase Date">{asset.purchaseDate ? fmtDate(asset.purchaseDate) : null}</KV>
            <KV label="Purchase Price">{fmtCurrency(asset.purchasePrice)}</KV>
            <KV label="Warranty Expiry">{asset.warrantyExpiry ? fmtDate(asset.warrantyExpiry) : null}</KV>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
          <div className="t-label" style={{ marginBottom: 12 }}>Specifications</div>
          {specs.length > 0
            ? <div style={{ fontSize: 13, lineHeight: 1.8 }}>{specs.join(' · ')}</div>
            : <span className="muted">—</span>}

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
          <div className="t-label" style={{ marginBottom: 12 }}>Software Installed</div>
          {asset.software.length > 0
            ? <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                {asset.software.map(s => <SoftwareChip key={s} label={s} />)}
              </div>
            : <span className="muted">None recorded</span>}

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
          <div className="t-label" style={{ marginBottom: 8 }}>Notes</div>
          <div style={{ fontSize: 13 }}>
            {asset.notes ? asset.notes : <span className="muted">—</span>}
          </div>
        </div>

        {/* Right column */}
        <div className="col gap-4">

          {/* Current assignment */}
          <div className="card" style={{ padding: 20 }}>
            <SectionTitle>Currently assigned to</SectionTitle>
            {emp ? (
              <>
                <div className="row gap-3" style={{ marginBottom: 12 }}>
                  <NameAvatar name={emp.name} size={40} />
                  <div className="col">
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{emp.name}</div>
                    <div className="muted" style={{ fontSize: 13 }}>{emp.jobTitle}</div>
                  </div>
                </div>
                <div className="row gap-2" style={{ marginBottom: 4 }}>
                  {COMPANY_BY_ID[emp.companyId] && (
                    <CompanyChip
                      code={COMPANY_BY_ID[emp.companyId].code}
                      name={COMPANY_BY_ID[emp.companyId].name}
                    />
                  )}
                </div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>
                  {BRANCH_BY_ID[emp.branchId]?.name}
                </div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 16 }}>
                  Since {fmtDate(cur!.assignedAt)}
                </div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => router.push(`/assets/transfer?asset=${id}`)}>
                  Transfer Asset
                </button>
              </>
            ) : (
              <>
                <EmptyState icon="user" title="Unassigned"
                  message="This asset is available for assignment." />
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                  onClick={() => router.push(`/assets/assign?asset=${id}`)}>
                  Assign Asset
                </button>
              </>
            )}
          </div>

          {/* Quick actions */}
          <div className="card" style={{ padding: 16 }}>
            <SectionTitle>Quick actions</SectionTitle>
            <div className="col gap-2">
              <button className="btn btn-secondary row gap-2" style={{ justifyContent: 'flex-start' }}>
                <Icon name="print" size={14} />Print Asset Label
              </button>
              <button className="btn btn-secondary row gap-2" style={{ justifyContent: 'flex-start' }}>
                <Icon name="download" size={14} />Download Asset Report
              </button>
              <button className="btn btn-secondary row gap-2" style={{ justifyContent: 'flex-start' }}>
                <Icon name="history" size={14} />View Transfer History
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Assignment history */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="row" style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          justifyContent: 'space-between',
        }}>
          <h3 className="t-h3" style={{ margin: 0 }}>Assignment History</h3>
          <span className="muted" style={{ fontSize: 13 }}>{history.length} record(s)</span>
        </div>
        {history.length === 0 ? (
          <div style={{ padding: 40 }}>
            <EmptyState icon="history" title="No assignments yet" />
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Job Title</th>
                <th>Company</th>
                <th>Assigned</th>
                <th>Returned</th>
                <th>Condition</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {history.map(a => {
                const e = EMPLOYEE_BY_ID[a.employeeId]
                const eCo = e ? COMPANY_BY_ID[e.companyId] : null
                if (!e) return null
                return (
                  <tr key={a.id}>
                    <td>
                      <div className="row gap-2">
                        <NameAvatar name={e.name} size={28} />
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{e.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{e.jobTitle}</td>
                    <td>
                      {eCo && <CompanyChip code={eCo.code} name={eCo.name} />}
                    </td>
                    <td className="muted" style={{ fontSize: 13 }}>{fmtDate(a.assignedAt)}</td>
                    <td>
                      {a.returnedAt
                        ? <span className="muted" style={{ fontSize: 13 }}>{fmtDate(a.returnedAt)}</span>
                        : <span className="badge badge-active">Current</span>}
                    </td>
                    <td>{a.condition ? ASSET_CONDITION_LABEL[a.condition] : '—'}</td>
                    <td>
                      {a.returnedAt
                        ? <span style={{ fontWeight: 600 }}>{daysBetween(a.assignedAt, a.returnedAt)}d</span>
                        : <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>Active</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AssetDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('auth_user')
    if (!stored) { router.push('/login'); return }
    setUser(JSON.parse(stored))
  }, [router])

  if (!user) return <Loading />

  return (
    <AppShell user={user} onLogout={() => { localStorage.removeItem('auth_user'); router.push('/login') }}>
      <AssetDetailContent id={params.id} />
    </AppShell>
  )
}
