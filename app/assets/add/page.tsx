'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast }       from 'sonner'
import { AppShell }    from '../../../components/layout/AppShell'
import { PageHeader }  from '../../../components/ui/PageHeader'
import { SectionTitle } from '../../../components/ui/SectionTitle'
import { FormRow }     from '../../../components/ui/FormRow'
import { Icon }        from '../../../components/icons/Icon'
import { Loading }     from '../../../components/ui/Loading'
import {
  ASSETS, BRANCHES, COMPANIES, COMPANY_BY_ID,
  ASSET_TYPE_LABEL, ASSET_CONDITION_LABEL,
} from '../../../lib/data'
import type { AssetType, AssetCondition } from '../../../lib/types'

// ─── Software chip ────────────────────────────────────────────────────────

function SoftwareChip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', fontSize: 12,
      padding: '3px 10px', background: 'var(--bg)',
      border: '1px solid var(--border)', borderRadius: 999, gap: 6,
    }}>
      {label}
      {onRemove && (
        <button onClick={onRemove}
          style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
          <Icon name="x" size={11} stroke="var(--text-2)" />
        </button>
      )}
    </span>
  )
}

function branchesFor(companyId: string) {
  return companyId ? BRANCHES.filter(b => b.companyId === companyId) : BRANCHES
}

const TYPE_CODE: Record<AssetType, string> = {
  LAPTOP: 'LT', PHONE: 'PH', TABLET: 'TB', MONITOR: 'MN', OTHER: 'OT',
}

const COND_OPTIONS: AssetCondition[] = ['NEW', 'GOOD', 'FAIR', 'DAMAGED']

// ─── Content ──────────────────────────────────────────────────────────────

function AddAssetContent() {
  const router = useRouter()

  const [companyId, setCompanyId] = useState('')
  const [branchId, setBranchId]   = useState('')
  const [type, setType]           = useState<AssetType | ''>('')
  const [brand, setBrand]         = useState('')
  const [model, setModel]         = useState('')
  const [serial, setSerial]       = useState('')
  const [condition, setCondition] = useState<AssetCondition | ''>('')
  const [processor, setProcessor] = useState('')
  const [ram, setRam]             = useState('')
  const [storage, setStorage]     = useState('')
  const [os, setOs]               = useState('')
  const [software, setSoftware]   = useState<string[]>(['Microsoft 365', 'Sophos Endpoint'])
  const [swInput, setSwInput]     = useState('')
  const [purchaseDate, setPurchaseDate]   = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [warrantyExpiry, setWarrantyExpiry] = useState('')
  const [notes, setNotes]         = useState('')
  const [saving, setSaving]       = useState(false)

  useEffect(() => { setBranchId('') }, [companyId])

  const previewTag = (() => {
    if (!companyId || !type) return '—'
    const co = COMPANY_BY_ID[companyId]
    if (!co) return '—'
    const count = ASSETS.filter(a => a.companyId === companyId && a.type === type).length
    return `${co.code}-${TYPE_CODE[type]}-${String(count + 1).padStart(3, '0')}`
  })()

  function addSoftware() {
    const trimmed = swInput.trim()
    if (trimmed && !software.includes(trimmed)) setSoftware(prev => [...prev, trimmed])
    setSwInput('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId, branchId, type, brand, model, serial, condition,
          processor, ram, storage, operatingSystem: os, software,
          purchaseDate: purchaseDate || undefined,
          purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
          warrantyExpiry: warrantyExpiry || undefined,
          notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')
      toast.success(`Asset ${previewTag} added`)
      router.push(`/assets/${data.id}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const availBranches = branchesFor(companyId)

  return (
    <div>
      <PageHeader
        title="Add New Asset"
        subtitle="Register a new laptop, phone, tablet or monitor."
        breadcrumb={
          <>
            <button className="btn btn-ghost btn-sm" style={{ padding: 0 }}
              onClick={() => router.push('/assets')}>Assets</button>
            <Icon name="chevronRight" size={14} stroke="var(--text-2)" />
            <span>Add new</span>
          </>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="col gap-4" style={{ maxWidth: 880 }}>

          {/* Card 1 — Asset identity */}
          <div className="card" style={{ padding: 24 }}>
            <SectionTitle>Asset identity</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              <FormRow label="Company" required>
                <select className="select" value={companyId}
                  onChange={e => setCompanyId(e.target.value)} required>
                  <option value="">Select company…</option>
                  {COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FormRow>

              <FormRow label="Branch" required>
                <select className="select" value={branchId}
                  onChange={e => setBranchId(e.target.value)} required disabled={!companyId}>
                  <option value="">Select branch…</option>
                  {availBranches.map((b: { id: string; name: string }) =>
                    <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </FormRow>

              <FormRow label="Type" required>
                <select className="select" value={type}
                  onChange={e => setType(e.target.value as AssetType)} required>
                  <option value="">Select type…</option>
                  {(Object.entries(ASSET_TYPE_LABEL) as [AssetType, string][]).map(([v, l]) =>
                    <option key={v} value={v}>{l}</option>)}
                </select>
              </FormRow>

              <FormRow label="Asset Tag">
                <div className="row" style={{
                  height: 'var(--input-h)', padding: '0 12px',
                  background: 'var(--bg)', border: '1px dashed var(--border)',
                  borderRadius: 8, gap: 8,
                }}>
                  <Icon name="lock" size={14} stroke="var(--text-2)" />
                  <span className="t-mono" style={{ color: 'var(--secondary)', fontWeight: 600 }}>
                    {previewTag}
                  </span>
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Auto-generated on save</div>
              </FormRow>

              <FormRow label="Brand" required>
                <input className="input" value={brand} onChange={e => setBrand(e.target.value)}
                  placeholder="Dell, HP, Apple…" required />
              </FormRow>

              <FormRow label="Model" required>
                <input className="input" value={model} onChange={e => setModel(e.target.value)}
                  placeholder="Latitude 7440" required />
              </FormRow>

              <FormRow label="Serial Number" required hint="Must be unique across the system">
                <input className="input t-mono" value={serial} onChange={e => setSerial(e.target.value)}
                  placeholder="DLL7440-78XQ4P" required />
              </FormRow>

              <FormRow label="Condition" required>
                <select className="select" value={condition}
                  onChange={e => setCondition(e.target.value as AssetCondition)} required>
                  <option value="">Select condition…</option>
                  {COND_OPTIONS.map(v =>
                    <option key={v} value={v}>{ASSET_CONDITION_LABEL[v]}</option>)}
                </select>
              </FormRow>

            </div>
          </div>

          {/* Card 2 — Specifications */}
          <div className="card" style={{ padding: 24 }}>
            <SectionTitle>Specifications</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              <FormRow label="Processor">
                <input className="input" value={processor} onChange={e => setProcessor(e.target.value)}
                  placeholder="Intel Core i7-1355U" />
              </FormRow>

              <FormRow label="RAM">
                <input className="input" value={ram} onChange={e => setRam(e.target.value)}
                  placeholder="32GB DDR5" />
              </FormRow>

              <FormRow label="Storage">
                <input className="input" value={storage} onChange={e => setStorage(e.target.value)}
                  placeholder="512GB NVMe SSD" />
              </FormRow>

              <FormRow label="Operating System">
                <input className="input" value={os} onChange={e => setOs(e.target.value)}
                  placeholder="Windows 11 Pro" />
              </FormRow>

              <div style={{ gridColumn: 'span 2' }}>
                <FormRow label="Software Installed" hint="Type a name and press Enter">
                  <div className="col gap-2">
                    {software.length > 0 && (
                      <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                        {software.map(s => (
                          <SoftwareChip key={s} label={s}
                            onRemove={() => setSoftware(sw => sw.filter(x => x !== s))} />
                        ))}
                      </div>
                    )}
                    <input className="input" value={swInput}
                      onChange={e => setSwInput(e.target.value)}
                      placeholder="e.g. Adobe Creative Cloud"
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSoftware() } }} />
                  </div>
                </FormRow>
              </div>

            </div>
          </div>

          {/* Card 3 — Purchase details */}
          <div className="card" style={{ padding: 24 }}>
            <SectionTitle>Purchase details</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              <FormRow label="Purchase Date">
                <input className="input" type="date" value={purchaseDate}
                  onChange={e => setPurchaseDate(e.target.value)} />
              </FormRow>

              <FormRow label="Purchase Price (GHS)">
                <input className="input" type="number" value={purchasePrice}
                  onChange={e => setPurchasePrice(e.target.value)}
                  placeholder="18,450.00" min="0" step="0.01" />
              </FormRow>

              <FormRow label="Warranty Expiry">
                <input className="input" type="date" value={warrantyExpiry}
                  onChange={e => setWarrantyExpiry(e.target.value)} />
              </FormRow>

              <div style={{ gridColumn: 'span 2' }}>
                <FormRow label="Notes">
                  <textarea className="textarea" value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Accessories, packaging, etc." rows={3} />
                </FormRow>
              </div>

            </div>
          </div>

          {/* Actions */}
          <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary"
              onClick={() => router.push('/assets')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Add Asset'}
            </button>
          </div>

        </div>
      </form>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AddAssetPage() {
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
      <AddAssetContent />
    </AppShell>
  )
}
