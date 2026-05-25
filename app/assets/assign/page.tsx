'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast }        from 'sonner'
import { AppShell }     from '../../../components/layout/AppShell'
import { PageHeader }   from '../../../components/ui/PageHeader'
import { SectionTitle } from '../../../components/ui/SectionTitle'
import { FormRow }      from '../../../components/ui/FormRow'
import { CompanyChip }  from '../../../components/ui/CompanyChip'
import { KindBadge }    from '../../../components/ui/badges'
import { Icon }         from '../../../components/icons/Icon'
import { Loading }      from '../../../components/ui/Loading'
import {
  ASSETS, ASSET_BY_ID, EMPLOYEES, EMPLOYEE_BY_ID,
  COMPANY_BY_ID, ASSET_TYPE_LABEL, ASSET_TYPE_ICON,
  ASSET_STATUS_LABEL,
} from '../../../lib/data'
import type { AssetType, AssetStatus } from '../../../lib/types'

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

// ─── Content ──────────────────────────────────────────────────────────────

function AssignAssetContent() {
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const preAssetId    = searchParams.get('asset')    ?? ''
  const preEmployeeId = searchParams.get('employee') ?? ''

  const today = new Date().toISOString().slice(0, 10)

  const [selectedAssetId,     setSelectedAssetId]     = useState(preAssetId)
  const [selectedEmployeeId,  setSelectedEmployeeId]  = useState(preEmployeeId)
  const [assignedAt,          setAssignedAt]          = useState(today)
  const [notes,               setNotes]               = useState('')
  const [saving,              setSaving]              = useState(false)

  const asset = selectedAssetId ? ASSET_BY_ID[selectedAssetId] : null
  const emp   = selectedEmployeeId ? EMPLOYEE_BY_ID[selectedEmployeeId] : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedAssetId || !selectedEmployeeId) return
    setSaving(true)
    try {
      const res = await fetch('/api/assets/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: selectedAssetId, employeeId: selectedEmployeeId, assignedAt, notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to assign')
      toast.success(`Asset assigned to ${EMPLOYEE_BY_ID[selectedEmployeeId].name}`)
      router.push(`/assets/${selectedAssetId}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Assign Asset"
        breadcrumb={
          <>
            <button className="btn btn-ghost btn-sm" style={{ padding: 0 }}
              onClick={() => router.push('/assets')}>Assets</button>
            <Icon name="chevronRight" size={14} stroke="var(--text-2)" />
            <span>Assign Asset</span>
          </>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="col gap-4" style={{ maxWidth: 680 }}>
          <div className="card" style={{ padding: 24 }}>
            <SectionTitle>Assignment details</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              {/* Asset field */}
              <div style={{ gridColumn: 'span 2' }}>
                {preAssetId && asset ? (
                  <div>
                    <div className="t-label" style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                      Asset <span style={{ color: 'var(--error)' }}>*</span>
                    </div>
                    <div style={{
                      padding: 16, background: 'var(--bg)',
                      border: '1px solid var(--border)', borderRadius: 8,
                    }} className="col gap-2">
                      <div className="row gap-3">
                        <TypeChip type={asset.type} />
                        <span className="t-mono" style={{ fontWeight: 600, color: 'var(--secondary)' }}>
                          {asset.assetTag}
                        </span>
                        <AssetStatusBadge value={asset.status} />
                      </div>
                      <div style={{ fontSize: 13 }}>{asset.brand} {asset.model}</div>
                      <div className="t-mono muted" style={{ fontSize: 12 }}>{asset.serial}</div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <button type="button" className="btn btn-ghost btn-sm"
                        onClick={() => router.push('/assets/assign')}>
                        Change asset
                      </button>
                    </div>
                  </div>
                ) : (
                  <FormRow label="Asset" required>
                    <select className="select" value={selectedAssetId}
                      onChange={e => setSelectedAssetId(e.target.value)} required>
                      <option value="">Select an available asset…</option>
                      {ASSETS.filter(a => a.status === 'AVAILABLE').map(a => (
                        <option key={a.id} value={a.id}>
                          {a.assetTag} — {a.brand} {a.model} ({a.serial})
                        </option>
                      ))}
                    </select>
                  </FormRow>
                )}
              </div>

              {/* Employee field */}
              <div style={{ gridColumn: 'span 2' }}>
                {preEmployeeId && emp ? (
                  <div>
                    <div className="t-label" style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                      Employee <span style={{ color: 'var(--error)' }}>*</span>
                    </div>
                    <div style={{
                      padding: 16, background: 'var(--bg)',
                      border: '1px solid var(--border)', borderRadius: 8,
                    }} className="col gap-1">
                      <div className="row gap-3">
                        <NameAvatar name={emp.name} size={32} />
                        <div className="col">
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{emp.name}</div>
                          <div className="muted" style={{ fontSize: 12 }}>{emp.jobTitle}</div>
                        </div>
                      </div>
                      {COMPANY_BY_ID[emp.companyId] && (
                        <CompanyChip
                          code={COMPANY_BY_ID[emp.companyId].code}
                          name={COMPANY_BY_ID[emp.companyId].name}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <FormRow label="Employee" required>
                    <select className="select" value={selectedEmployeeId}
                      onChange={e => setSelectedEmployeeId(e.target.value)} required>
                      <option value="">Select employee…</option>
                      {EMPLOYEES.filter(e => e.active).map(e => {
                        const co = COMPANY_BY_ID[e.companyId]
                        return (
                          <option key={e.id} value={e.id}>
                            {e.name} — {e.jobTitle} ({co?.code ?? e.companyId})
                          </option>
                        )
                      })}
                    </select>
                  </FormRow>
                )}
              </div>

              <FormRow label="Date Assigned" required span={1}>
                <input className="input" type="date" value={assignedAt}
                  onChange={e => setAssignedAt(e.target.value)} required />
              </FormRow>

              <div style={{ gridColumn: 'span 2' }}>
                <FormRow label="Notes">
                  <textarea className="textarea" value={notes} onChange={e => setNotes(e.target.value)}
                    rows={2} />
                </FormRow>
              </div>

            </div>
          </div>

          <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary"
              onClick={() => router.push('/assets')}>Cancel</button>
            <button type="submit" className="btn btn-primary"
              disabled={saving || !selectedAssetId || !selectedEmployeeId}>
              {saving ? 'Saving…' : 'Assign Asset'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AssignAssetPage() {
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
      <AssignAssetContent />
    </AppShell>
  )
}
