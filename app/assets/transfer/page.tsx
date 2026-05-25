'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast }        from 'sonner'
import { AppShell }     from '../../../components/layout/AppShell'
import { PageHeader }   from '../../../components/ui/PageHeader'
import { SectionTitle } from '../../../components/ui/SectionTitle'
import { FormRow }      from '../../../components/ui/FormRow'
import { KindBadge }    from '../../../components/ui/badges'
import { Icon }         from '../../../components/icons/Icon'
import { Loading }      from '../../../components/ui/Loading'
import { fmtDate }      from '../../../lib/utils'
import {
  ASSETS, ASSET_BY_ID, EMPLOYEES, EMPLOYEE_BY_ID,
  ASSET_ASSIGNMENTS, COMPANY_BY_ID,
  ASSET_TYPE_LABEL, ASSET_TYPE_ICON,
  ASSET_STATUS_LABEL, ASSET_CONDITION_LABEL,
  TRANSFER_REASON_LABEL, TRANSFER_REASON_ICON,
} from '../../../lib/data'
import type { AssetType, AssetStatus, AssetCondition, TransferReason } from '../../../lib/types'

// ─── Local helpers ────────────────────────────────────────────────────────

function TypeChip({ type }: { type: AssetType }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500,
      padding: '3px 9px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 999,
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

const REASON_CONFIG: Record<TransferReason, { accent: string; desc: string }> = {
  RESIGNATION:   { accent: '#DC2626', desc: 'Employee has resigned or left the company' },
  BEYOND_REPAIR: { accent: '#D97706', desc: 'Device is damaged beyond economical repair' },
  UPGRADE:       { accent: '#16A34A', desc: 'Employee is receiving a newer/better device' },
  REASSIGNMENT:  { accent: '#2563EB', desc: 'Asset moving to a different person or department' },
  OTHER:         { accent: '#6B7280', desc: 'Any other reason for the change' },
}

const REASONS: TransferReason[] = ['RESIGNATION', 'BEYOND_REPAIR', 'UPGRADE', 'REASSIGNMENT', 'OTHER']
const COND_OPTIONS: AssetCondition[] = ['NEW', 'GOOD', 'FAIR', 'DAMAGED', 'BEYOND_REPAIR']

// ─── Stepper ──────────────────────────────────────────────────────────────

function Stepper({ step }: { step: number }) {
  const steps = ['Select Asset', 'Transfer Reason', 'New Holder', 'Review & Generate']
  return (
    <div className="row gap-4" style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
      {steps.map((label, i) => {
        const n = i + 1
        const isActive = step === n
        const isDone   = step > n
        return (
          <div key={n} className="row gap-2">
            <span className={`step-num${isActive ? ' active' : isDone ? ' done' : ''}`}>
              {isDone ? <Icon name="check" size={13} /> : n}
            </span>
            <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--text)' : 'var(--text-2)' }}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Content ──────────────────────────────────────────────────────────────

function TransferContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const preAssetId   = searchParams.get('asset') ?? ''

  const [step,               setStep]              = useState(1)
  const [selectedAssetId,    setSelectedAssetId]   = useState(preAssetId)
  const [reason,             setReason]            = useState<TransferReason | ''>('')
  const [reasonNotes,        setReasonNotes]       = useState('')
  const [fromCondition,      setFromCondition]     = useState<AssetCondition | ''>('')
  const [returnedAt,         setReturnedAt]        = useState('')
  const [toOption,           setToOption]          = useState<'new_employee' | 'return_to_store'>('new_employee')
  const [toEmployeeId,       setToEmployeeId]      = useState('')
  const [assignedAt,         setAssignedAt]        = useState('')
  const [authorisedBy,       setAuthorisedBy]      = useState('')
  const [saving,             setSaving]            = useState(false)

  const [authUser, setAuthUser] = useState<{ name: string } | null>(null)
  useEffect(() => {
    const stored = localStorage.getItem('auth_user')
    if (stored) setAuthUser(JSON.parse(stored))
  }, [])

  const asset  = selectedAssetId ? ASSET_BY_ID[selectedAssetId] : null
  const cur    = asset ? currentEmployeeFor(asset.id) : null
  const curEmp = cur ? EMPLOYEE_BY_ID[cur.employeeId] : null
  const co     = asset ? COMPANY_BY_ID[asset.companyId] : null

  const refPreview = asset && co
    ? `${co.code}/ASSET/XXX/26`
    : '—'

  async function handleConfirm() {
    if (!selectedAssetId || !reason || !authorisedBy) return
    setSaving(true)
    try {
      const res = await fetch('/api/assets/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: selectedAssetId, reason, reasonNotes,
          fromCondition: fromCondition || undefined,
          returnedAt: returnedAt || undefined,
          toEmployeeId: toEmployeeId || undefined,
          assignedAt: assignedAt || undefined,
          authorisedBy,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate transfer')
      toast.success(`${data.referenceNumber} generated`)
      router.push(`/assets/transfers/${data.id}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const canAdvance = (
    (step === 1 && !!selectedAssetId) ||
    (step === 2 && !!reason) ||
    (step === 3) ||
    (step === 4 && !!authorisedBy)
  )

  return (
    <div>
      <PageHeader
        title="Transfer Asset"
        breadcrumb={
          <>
            <button className="btn btn-ghost btn-sm" style={{ padding: 0 }}
              onClick={() => router.push('/assets')}>Assets</button>
            <Icon name="chevronRight" size={14} stroke="var(--text-2)" />
            <span>Transfer</span>
          </>
        }
      />

      {/* Stepper */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        <Stepper step={step} />
      </div>

      {/* Step 1 — Select Asset */}
      {step === 1 && (
        <div className="card step-pane" style={{ padding: 24, marginBottom: 16 }}>
          <SectionTitle>Which asset are you transferring?</SectionTitle>

          {asset ? (
            <div>
              <div style={{
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 10, padding: 20,
              }} className="col gap-2">
                <div className="row gap-3">
                  <TypeChip type={asset.type} />
                  <span className="t-mono" style={{ fontWeight: 600, color: 'var(--secondary)' }}>
                    {asset.assetTag}
                  </span>
                  <AssetStatusBadge value={asset.status} />
                </div>
                <div>
                  <span style={{ fontWeight: 500 }}>{asset.brand}</span>
                  <span className="muted"> {asset.model}</span>
                </div>
                <div className="t-mono muted" style={{ fontSize: 12 }}>Serial: {asset.serial}</div>
                {curEmp && (
                  <>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                    <div className="t-label" style={{ marginBottom: 8 }}>Currently assigned to</div>
                    <div className="row gap-3">
                      <NameAvatar name={curEmp.name} size={32} />
                      <div className="col">
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{curEmp.name}</div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {curEmp.jobTitle} · {COMPANY_BY_ID[curEmp.companyId]?.code}
                        </div>
                      </div>
                      <span className="muted" style={{ fontSize: 12 }}>
                        since {fmtDate(cur!.assignedAt)}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}
                onClick={() => { setSelectedAssetId(''); router.push('/assets/transfer') }}>
                Change asset
              </button>
            </div>
          ) : (
            <div>
              <div style={{
                border: '1px solid var(--border)', borderRadius: 8,
                maxHeight: 360, overflow: 'auto',
              }}>
                {ASSETS.filter(a => a.status === 'ASSIGNED').map(a => {
                  const c = currentEmployeeFor(a.id)
                  const e = c ? EMPLOYEE_BY_ID[c.employeeId] : null
                  return (
                    <div key={a.id} className="row" style={{
                      padding: 12, borderBottom: '1px solid var(--border)',
                      justifyContent: 'space-between',
                    }}>
                      <div className="col gap-1">
                        <div className="row gap-2">
                          <TypeChip type={a.type} />
                          <span className="t-mono" style={{ fontWeight: 600, color: 'var(--secondary)' }}>
                            {a.assetTag}
                          </span>
                        </div>
                        <div className="muted" style={{ fontSize: 12 }}>{a.brand} {a.model}</div>
                        {e && <div className="muted" style={{ fontSize: 12 }}>→ {e.name}</div>}
                      </div>
                      <button className="btn btn-primary btn-sm"
                        onClick={() => setSelectedAssetId(a.id)}>Select</button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2 — Transfer Reason */}
      {step === 2 && (
        <div className="card step-pane" style={{ padding: 24, marginBottom: 16 }}>
          <SectionTitle>Why is this asset being transferred?</SectionTitle>
          <div className="col gap-3">
            {REASONS.map(r => {
              const cfg     = REASON_CONFIG[r]
              const selected = reason === r
              return (
                <div key={r} onClick={() => setReason(r)}
                  style={{
                    border: `2px solid ${selected ? 'var(--secondary)' : 'var(--border)'}`,
                    boxShadow: selected ? '0 0 0 4px rgba(37,99,235,0.1)' : 'none',
                    borderRadius: 10, padding: 20, cursor: 'pointer',
                  }}>
                  <div className="row gap-3" style={{ marginBottom: selected ? 16 : 0 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: `${cfg.accent}15`, display: 'grid', placeItems: 'center', flexShrink: 0,
                    }}>
                      <Icon name={TRANSFER_REASON_ICON[r] as never} size={20} stroke={cfg.accent} />
                    </div>
                    <div className="col">
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{TRANSFER_REASON_LABEL[r]}</div>
                      <div className="muted" style={{ fontSize: 13 }}>{cfg.desc}</div>
                    </div>
                  </div>

                  {selected && (
                    <div className="step-pane" onClick={e => e.stopPropagation()}>
                      {r === 'RESIGNATION' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <FormRow label="Date returned" required>
                            <input className="input" type="date" value={returnedAt}
                              onChange={e => setReturnedAt(e.target.value)} />
                          </FormRow>
                          <FormRow label="Condition on return" required>
                            <select className="select" value={fromCondition}
                              onChange={e => setFromCondition(e.target.value as AssetCondition)}>
                              <option value="">Select…</option>
                              {COND_OPTIONS.map(v =>
                                <option key={v} value={v}>{ASSET_CONDITION_LABEL[v]}</option>)}
                            </select>
                          </FormRow>
                        </div>
                      )}
                      {r === 'BEYOND_REPAIR' && (
                        <FormRow label="Damage description" required>
                          <textarea className="textarea" value={reasonNotes}
                            onChange={e => setReasonNotes(e.target.value)} rows={2} />
                        </FormRow>
                      )}
                      {r === 'UPGRADE' && (
                        <FormRow label="Reason for upgrade">
                          <input className="input" value={reasonNotes}
                            onChange={e => setReasonNotes(e.target.value)} />
                        </FormRow>
                      )}
                      {r === 'REASSIGNMENT' && (
                        <FormRow label="Reason">
                          <input className="input" value={reasonNotes}
                            onChange={e => setReasonNotes(e.target.value)} />
                        </FormRow>
                      )}
                      {r === 'OTHER' && (
                        <FormRow label="Reason" required>
                          <textarea className="textarea" value={reasonNotes}
                            onChange={e => setReasonNotes(e.target.value)} rows={2} />
                        </FormRow>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 3 — New Holder */}
      {step === 3 && (
        <div className="card step-pane" style={{ padding: 24, marginBottom: 16 }}>
          {reason === 'RESIGNATION' || reason === 'BEYOND_REPAIR' ? (
            <>
              <SectionTitle>
                {reason === 'RESIGNATION' ? 'Assign to someone new or return to store?' : 'What happens next?'}
              </SectionTitle>
              <div className="row gap-3">
                {(['new_employee', 'return_to_store'] as const).map(opt => (
                  <div key={opt} onClick={() => setToOption(opt)} style={{
                    flex: 1, border: `2px solid ${toOption === opt ? 'var(--secondary)' : 'var(--border)'}`,
                    borderRadius: 8, padding: 16, cursor: 'pointer',
                  }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>
                      {opt === 'new_employee'
                        ? (reason === 'BEYOND_REPAIR' ? 'Assign replacement to same employee' : 'Assign to new employee')
                        : (reason === 'BEYOND_REPAIR' ? 'Retire asset (no replacement)' : 'Return to store (unassigned)')}
                    </div>
                    {toOption === opt && opt === 'new_employee' && (
                      <div style={{ marginTop: 12 }}>
                        <FormRow label="Employee" required>
                          <select className="select" value={toEmployeeId}
                            onChange={e => setToEmployeeId(e.target.value)}>
                            <option value="">Select employee…</option>
                            {EMPLOYEES.filter(e => e.active).map(e => {
                              const c = COMPANY_BY_ID[e.companyId]
                              return (
                                <option key={e.id} value={e.id}>
                                  {e.name} — {e.jobTitle} ({c?.code})
                                </option>
                              )
                            })}
                          </select>
                        </FormRow>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <SectionTitle>Who receives this asset?</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FormRow label="New employee" required>
                  <select className="select" value={toEmployeeId}
                    onChange={e => setToEmployeeId(e.target.value)}>
                    <option value="">Select employee…</option>
                    {EMPLOYEES.filter(e => e.active).map(e => {
                      const c = COMPANY_BY_ID[e.companyId]
                      return (
                        <option key={e.id} value={e.id}>
                          {e.name} — {e.jobTitle} ({c?.code})
                        </option>
                      )
                    })}
                  </select>
                </FormRow>
                <FormRow label="Date assigned" required>
                  <input className="input" type="date" value={assignedAt}
                    onChange={e => setAssignedAt(e.target.value)} />
                </FormRow>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 4 — Review & Generate */}
      {step === 4 && (
        <div className="card step-pane" style={{ padding: 24, marginBottom: 16 }}>
          <SectionTitle>Review and confirm</SectionTitle>

          <div style={{
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 8, padding: 20,
          }} className="col gap-4">
            {([
              ['Reference', <span key="ref" className="t-mono" style={{ fontWeight: 600, color: 'var(--secondary)' }}>{refPreview}</span>],
              ['Asset', asset ? `${asset.brand} ${asset.model} · ${asset.assetTag}` : '—'],
              ['Previous holder', curEmp?.name ?? '—'],
              ['Reason', reason ? TRANSFER_REASON_LABEL[reason as TransferReason] : '—'],
              ['New holder', toEmployeeId
                ? EMPLOYEE_BY_ID[toEmployeeId]?.name
                : <span key="nh" style={{ fontStyle: 'italic' }} className="muted">
                    {reason === 'BEYOND_REPAIR' ? 'Asset being retired' : 'Returning to store'}
                  </span>],
            ] as [string, React.ReactNode][]).map(([label, value]) => (
              <div key={label} className="row" style={{ justifyContent: 'space-between', gap: 16 }}>
                <div className="t-label" style={{ fontSize: 11 }}>{label}</div>
                <div style={{ fontSize: 14 }}>{value}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 20, marginTop: 16 }}>
            <SectionTitle>Authorisation</SectionTitle>
            <div className="col gap-4">
              <FormRow label="Authorised by" required>
                <input className="input" value={authorisedBy}
                  onChange={e => setAuthorisedBy(e.target.value)}
                  placeholder="Manager name" />
              </FormRow>
              <FormRow label="Processed by">
                <div className="row" style={{
                  height: 'var(--input-h)', padding: '0 12px',
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 8, fontSize: 14,
                }}>
                  {authUser?.name ?? '—'}
                </div>
              </FormRow>
            </div>
          </div>

          <div style={{
            padding: 12, background: '#fef3c7', borderRadius: 6,
            fontSize: 12, color: '#92400e', marginTop: 16,
          }} className="row gap-2">
            <Icon name="alert" size={14} stroke="#92400e" />
            This action cannot be undone. A Change of Asset document will be generated and saved permanently.
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
        <button type="button" className="btn btn-secondary row gap-2"
          onClick={() => step === 1 ? router.push('/assets') : setStep(s => s - 1)}>
          <Icon name="chevronLeft" size={14} />
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        <span className="muted" style={{ fontSize: 13 }}>Step {step} of 4</span>

        {step < 4 ? (
          <button type="button" className="btn btn-primary row gap-2"
            disabled={!canAdvance}
            onClick={() => setStep(s => s + 1)}>
            Continue <Icon name="chevronRight" size={14} />
          </button>
        ) : (
          <button type="button" className="btn btn-primary row gap-2"
            disabled={saving || !authorisedBy}
            onClick={handleConfirm}>
            <Icon name="check" size={14} />
            {saving ? 'Generating…' : 'Generate Document'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function TransferAssetPage() {
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
      <TransferContent />
    </AppShell>
  )
}
