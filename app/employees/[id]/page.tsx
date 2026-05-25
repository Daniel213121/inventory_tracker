'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast }        from 'sonner'
import { AppShell }     from '../../../components/layout/AppShell'
import { PageHeader }   from '../../../components/ui/PageHeader'
import { SectionTitle } from '../../../components/ui/SectionTitle'
import { FormRow }      from '../../../components/ui/FormRow'
import { EmptyState }   from '../../../components/ui/EmptyState'
import { KindBadge }    from '../../../components/ui/badges'
import { CompanyChip }  from '../../../components/ui/CompanyChip'
import { Icon }         from '../../../components/icons/Icon'
import { Loading }      from '../../../components/ui/Loading'
import { fmtDate, fmtDateShort } from '../../../lib/utils'
import {
  EMPLOYEES, EMPLOYEE_BY_ID,
  BRANCH_BY_ID,
  ASSETS, ASSET_BY_ID,
  ASSET_ASSIGNMENTS, ASSET_TRANSFERS,
  COMPANY_BY_ID,
  ASSET_TYPE_LABEL, ASSET_TYPE_ICON,
  TRANSFER_REASON_LABEL,
} from '../../../lib/data'
import type { AssetType } from '../../../lib/types'

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

function employeeHistoryFor(employeeId: string) {
  return ASSET_ASSIGNMENTS
    .filter(a => a.employeeId === employeeId)
    .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt))
}

// ─── Resignation Modal ────────────────────────────────────────────────────

interface ResignModalProps {
  currentAssets: { assignment: typeof ASSET_ASSIGNMENTS[0]; asset: typeof ASSETS[0] }[]
  onClose: () => void
  onConfirm: (date: string, notes: string) => void
}

function ResignModal({ currentAssets, onClose, onConfirm }: ResignModalProps) {
  const router = useRouter()
  const [resignDate, setResignDate]   = useState('')
  const [resignNotes, setResignNotes] = useState('')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card" style={{ width: 480, padding: 24 }} onClick={e => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 className="t-h3" style={{ margin: 0 }}>Record Resignation</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}
            style={{ padding: '0 8px' }}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="col gap-4">
          <FormRow label="Resignation date" required>
            <input className="input" type="date" value={resignDate}
              onChange={e => setResignDate(e.target.value)} />
          </FormRow>

          <FormRow label="Notes">
            <textarea className="textarea" value={resignNotes}
              onChange={e => setResignNotes(e.target.value)} rows={3} />
          </FormRow>

          {currentAssets.length > 0 ? (
            <div style={{
              padding: 12, background: '#fef3c7',
              border: '1px solid #fde68a', borderRadius: 6,
            }} className="col gap-2">
              <div className="row gap-2" style={{ fontWeight: 600, fontSize: 13 }}>
                <Icon name="alert" size={14} stroke="#92400e" />
                Assets must be transferred before resignation can be recorded.
              </div>
              <div className="col gap-2" style={{ marginTop: 4 }}>
                {currentAssets.map(({ asset }) => (
                  <div key={asset.id} className="row gap-2" style={{ justifyContent: 'space-between' }}>
                    <div className="row gap-2">
                      <TypeChip type={asset.type} />
                      <span className="t-mono" style={{ fontSize: 12 }}>{asset.assetTag}</span>
                    </div>
                    <button className="btn btn-secondary btn-sm"
                      onClick={() => router.push(`/assets/transfer?asset=${asset.id}`)}>
                      Transfer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="row gap-2" style={{
              padding: 12, background: '#f0fdf4',
              border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 13,
            }}>
              <Icon name="check" size={14} stroke="#16A34A" />
              All assets have been returned — safe to proceed.
            </div>
          )}
        </div>

        <div className="row gap-2" style={{ justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger"
            disabled={!resignDate || currentAssets.length > 0}
            onClick={() => onConfirm(resignDate, resignNotes)}>
            Confirm Resignation
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Content ──────────────────────────────────────────────────────────────

function EmployeeDetailContent({ id }: { id: string }) {
  const router = useRouter()

  const e       = EMPLOYEE_BY_ID[id] ?? EMPLOYEES[0]
  const co      = COMPANY_BY_ID[e.companyId]
  const history = employeeHistoryFor(e.id)

  const currentAssets = ASSET_ASSIGNMENTS
    .filter(a => a.employeeId === e.id && a.returnedAt == null)
    .map(a => ({ assignment: a, asset: ASSET_BY_ID[a.assetId] }))
    .filter(x => x.asset != null) as { assignment: typeof ASSET_ASSIGNMENTS[0]; asset: typeof ASSETS[0] }[]

  const [showResignModal, setShowResignModal] = useState(false)

  async function handleResign(resignDate: string, notes: string) {
    try {
      const res = await fetch(`/api/employees/${e.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resignedAt: resignDate, notes }),
      })
      if (!res.ok) throw new Error('Failed to record resignation')
      toast.success(`Resignation recorded for ${e.name}`)
      setShowResignModal(false)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div>
      <PageHeader
        title={e.name}
        breadcrumb={
          <>
            <button className="btn btn-ghost btn-sm" style={{ padding: 0 }}
              onClick={() => router.push('/employees')}>Employees</button>
            <Icon name="chevronRight" size={14} stroke="var(--text-2)" />
            <span>{e.name}</span>
          </>
        }
        actions={
          <>
            <button className="btn btn-secondary btn-sm row gap-2">
              <Icon name="edit" size={14} />Edit
            </button>
            {e.active && (
              <>
                <button className="btn btn-primary btn-sm row gap-2"
                  onClick={() => router.push(`/assets/assign?employee=${e.id}`)}>
                  <Icon name="plus" size={14} />Assign Asset
                </button>
                <button className="btn btn-danger btn-sm row gap-2"
                  onClick={() => setShowResignModal(true)}>
                  <Icon name="userX" size={14} />Record Resignation
                </button>
              </>
            )}
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>

        {/* Left — Employee details */}
        <div className="card" style={{ padding: 24 }}>
          <SectionTitle>Personal details</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, rowGap: 24 }}>
            <KV label="Company">
              {co && <CompanyChip code={co.code} name={co.name} />}
            </KV>
            <KV label="Branch">{BRANCH_BY_ID[e.branchId]?.name}</KV>
            <KV label="Job Title">{e.jobTitle}</KV>
            <KV label="Department">{e.department}</KV>
            <KV label="Employee ID" mono>{e.employeeId || null}</KV>
            <KV label="Email">{e.email || null}</KV>
            <KV label="Phone">{e.phone || null}</KV>
            <KV label="Date Joined">{fmtDate(e.joinedAt)}</KV>
          </div>

          {!e.active && e.resignedAt && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 8, padding: 16, marginTop: 20,
            }}>
              <div className="row gap-2" style={{ marginBottom: 8 }}>
                <KindBadge kind="faulty">RESIGNED</KindBadge>
              </div>
              <div>
                <div className="t-label" style={{ fontSize: 11, marginBottom: 4 }}>Date Resigned</div>
                <div style={{ fontSize: 14 }}>{fmtDate(e.resignedAt)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="col gap-4">
          <div className="card" style={{ padding: 20 }}>
            <SectionTitle>Currently assigned</SectionTitle>
            {currentAssets.length > 0 ? (
              <div className="col gap-3">
                {currentAssets.map(({ assignment, asset }) => (
                  <div key={asset.id} className="row gap-3" style={{
                    padding: 12, background: 'var(--bg)',
                    borderRadius: 8, border: '1px solid var(--border)',
                  }}>
                    <TypeChip type={asset.type} />
                    <div className="col" style={{ flex: 1, minWidth: 0 }}>
                      <span className="t-mono" style={{ fontWeight: 600, color: 'var(--secondary)', fontSize: 13 }}>
                        {asset.assetTag}
                      </span>
                      <span className="muted" style={{ fontSize: 12 }}>{asset.brand} {asset.model}</span>
                      <span className="muted" style={{ fontSize: 11 }}>
                        since {fmtDateShort(assignment.assignedAt)}
                      </span>
                    </div>
                    <button className="btn btn-secondary btn-sm row gap-2"
                      onClick={() => router.push(`/assets/${asset.id}`)}>
                      <Icon name="eye" size={14} />View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="monitor" title="No assets assigned"
                message="No devices currently assigned to this employee." />
            )}
          </div>
        </div>
      </div>

      {/* Asset history */}
      <div className="card" style={{ overflow: 'hidden', marginTop: 16 }}>
        <div className="row" style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          justifyContent: 'space-between',
        }}>
          <h3 className="t-h3" style={{ margin: 0 }}>Asset History</h3>
          <span className="muted" style={{ fontSize: 13 }}>{history.length} record(s)</span>
        </div>
        {history.length === 0 ? (
          <div style={{ padding: 40 }}>
            <EmptyState icon="history" title="No history" />
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Type</th>
                <th>Brand / Model</th>
                <th>Assigned</th>
                <th>Returned</th>
                <th>Reason</th>
                <th>Transfer Doc</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => {
                const asset = ASSET_BY_ID[h.assetId]
                if (!asset) return null
                const transfer = ASSET_TRANSFERS.find(
                  t => t.assetId === h.assetId && t.fromEmployeeId === e.id
                )
                return (
                  <tr key={h.id}>
                    <td>
                      <span className="t-mono" style={{ fontWeight: 600, color: 'var(--secondary)' }}>
                        {asset.assetTag}
                      </span>
                    </td>
                    <td><TypeChip type={asset.type} /></td>
                    <td style={{ fontSize: 13 }}>{asset.brand} {asset.model}</td>
                    <td className="muted" style={{ fontSize: 13 }}>{fmtDate(h.assignedAt)}</td>
                    <td>
                      {h.returnedAt
                        ? <span className="muted" style={{ fontSize: 13 }}>{fmtDate(h.returnedAt)}</span>
                        : <span className="badge badge-active">Current</span>}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {transfer
                        ? TRANSFER_REASON_LABEL[transfer.reason]
                        : <span className="muted">—</span>}
                    </td>
                    <td>
                      {transfer ? (
                        <button className="btn btn-ghost btn-sm t-mono"
                          style={{ color: 'var(--secondary)', fontWeight: 500, fontSize: 13 }}
                          onClick={() => router.push(`/assets/transfers/${transfer.id}`)}>
                          {transfer.referenceNumber}
                        </button>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showResignModal && (
        <ResignModal
          currentAssets={currentAssets}
          onClose={() => setShowResignModal(false)}
          onConfirm={handleResign}
        />
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function EmployeeDetailPage() {
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
      <EmployeeDetailContent id={params.id} />
    </AppShell>
  )
}
