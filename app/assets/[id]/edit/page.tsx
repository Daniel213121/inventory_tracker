'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast }       from 'sonner'
import { AppShell }    from '../../../../components/layout/AppShell'
import { PageHeader }  from '../../../../components/ui/PageHeader'
import { SectionTitle } from '../../../../components/ui/SectionTitle'
import { FormRow }     from '../../../../components/ui/FormRow'
import { Icon }        from '../../../../components/icons/Icon'
import { Loading }     from '../../../../components/ui/Loading'
import {
  ASSET_TYPE_LABEL, ASSET_CONDITION_LABEL, ASSET_STATUS_LABEL,
} from '../../../../lib/data'
import { getAsset, updateAsset } from '../../../../app/actions/assets'
import { listCompanies, listBranches, createBranch } from '../../../../app/actions/settings'
import { OS_OPTIONS } from '../../../../lib/os-options'
import type { AssetType, AssetCondition, AssetStatus, Asset, Company, Branch } from '../../../../lib/types'

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

const COND_OPTIONS: AssetCondition[] = ['NEW', 'GOOD', 'FAIR', 'DAMAGED', 'BEYOND_REPAIR']
const STATUS_OPTIONS: AssetStatus[]  = ['AVAILABLE', 'ASSIGNED', 'UNDER_REPAIR', 'RETIRED']

// ─── Content ──────────────────────────────────────────────────────────────

function EditAssetContent({ id }: { id: string }) {
  const router = useRouter()
  const [asset, setAsset]     = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)

  const [companies, setCompanies] = useState<Company[]>([])
  const [branches, setBranches]   = useState<Branch[]>([])

  const [companyId, setCompanyId] = useState('')
  const [branchId, setBranchId]   = useState('')
  const [type, setType]           = useState<AssetType>('LAPTOP')
  const [assetTag, setAssetTag]   = useState('')
  const [brand, setBrand]         = useState('')
  const [model, setModel]         = useState('')
  const [serial, setSerial]       = useState('')
  const [condition, setCondition] = useState<AssetCondition>('GOOD')
  const [status, setStatus]       = useState<AssetStatus>('AVAILABLE')
  const [processor, setProcessor] = useState('')
  const [ram, setRam]             = useState('')
  const [storage, setStorage]     = useState('')
  const [os, setOs]               = useState('')
  const [software, setSoftware]   = useState<string[]>([])
  const [swInput, setSwInput]     = useState('')
  const [purchaseDate, setPurchaseDate]     = useState('')
  const [purchasePrice, setPurchasePrice]   = useState('')
  const [warrantyExpiry, setWarrantyExpiry] = useState('')
  const [notes, setNotes]         = useState('')
  const [saving, setSaving]       = useState(false)

  const [isAddingBranch, setIsAddingBranch] = useState(false)
  const [newBranchName, setNewBranchName]   = useState('')
  const [branchSaving, setBranchSaving]     = useState(false)

  useEffect(() => {
    listCompanies().then(setCompanies)
  }, [])

  useEffect(() => {
    listBranches(companyId || undefined).then(setBranches)
  }, [companyId])

  function handleBranchChange(value: string) {
    if (value === '__add_new__') { setIsAddingBranch(true); return }
    setBranchId(value)
  }

  async function confirmNewBranch() {
    const name = newBranchName.trim()
    if (!name || !companyId) return
    setBranchSaving(true)
    try {
      const branch = await createBranch(name, companyId)
      setBranches(prev => [...prev, branch])
      setBranchId(branch.id)
      setIsAddingBranch(false)
      setNewBranchName('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create branch')
    } finally {
      setBranchSaving(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    getAsset(id).then(a => {
      if (a) {
        const ax = a as Asset
        setAsset(ax)
        setCompanyId(ax.companyId)
        setBranchId(ax.branchId)
        setType(ax.type)
        setAssetTag(ax.assetTag)
        setBrand(ax.brand)
        setModel(ax.model)
        setSerial(ax.serial)
        setCondition(ax.condition)
        setStatus(ax.status)
        setProcessor(ax.processor ?? '')
        setRam(ax.ram ?? '')
        setStorage(ax.storage ?? '')
        setOs(ax.operatingSystem ?? '')
        setSoftware(ax.software)
        setPurchaseDate(ax.purchaseDate ?? '')
        setPurchasePrice(ax.purchasePrice?.toString() ?? '')
        setWarrantyExpiry(ax.warrantyExpiry ?? '')
        setNotes(ax.notes ?? '')
      }
      setLoading(false)
    })
  }, [id])

  function addSoftware() {
    const trimmed = swInput.trim()
    if (trimmed && !software.includes(trimmed)) setSoftware(prev => [...prev, trimmed])
    setSwInput('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateAsset(id, {
        companyId, branchId, type, assetTag, brand, model, serial, condition, status,
        processor: processor || null,
        ram: ram || null,
        storage: storage || null,
        operatingSystem: os || null,
        software,
        purchaseDate: purchaseDate || null,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        warrantyExpiry: warrantyExpiry || null,
        notes: notes || null,
      })
      toast.success(`Asset ${assetTag} updated`)
      router.push(`/assets/${id}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const availBranches = branches

  if (loading || !asset) return <Loading />

  return (
    <div>
      <PageHeader
        title={`Edit ${asset.brand} ${asset.model}`}
        subtitle="Update asset details and status."
        breadcrumb={
          <>
            <button className="btn btn-ghost btn-sm" style={{ padding: 0 }}
              onClick={() => router.push('/assets')}>Assets</button>
            <Icon name="chevronRight" size={14} stroke="var(--text-2)" />
            <button className="btn btn-ghost btn-sm" style={{ padding: 0 }}
              onClick={() => router.push(`/assets/${id}`)}>{asset.assetTag}</button>
            <Icon name="chevronRight" size={14} stroke="var(--text-2)" />
            <span>Edit</span>
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
                  onChange={e => { setCompanyId(e.target.value); setBranchId('') }} required>
                  <option value="">Select company…</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FormRow>

              <FormRow label="Branch" required>
                <select className="select" value={branchId}
                  onChange={e => handleBranchChange(e.target.value)} required disabled={!companyId}>
                  <option value="">Select branch…</option>
                  {availBranches.map((b: { id: string; name: string }) =>
                    <option key={b.id} value={b.id}>{b.name}</option>)}
                  <option value="__add_new__">+ Add new branch</option>
                </select>
                {isAddingBranch && (
                  <div className="row gap-2" style={{ marginTop: 8 }}>
                    <input className="input" value={newBranchName}
                      onChange={e => setNewBranchName(e.target.value)}
                      placeholder="e.g. Kumasi Office" autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmNewBranch() } }} />
                    <button type="button" className="btn btn-primary btn-sm" onClick={confirmNewBranch} disabled={branchSaving}>
                      {branchSaving ? '…' : 'Add'}
                    </button>
                  </div>
                )}
              </FormRow>

              <FormRow label="Type" required>
                <select className="select" value={type}
                  onChange={e => setType(e.target.value as AssetType)} required>
                  {(Object.entries(ASSET_TYPE_LABEL) as [AssetType, string][]).map(([v, l]) =>
                    <option key={v} value={v}>{l}</option>)}
                </select>
              </FormRow>

              <FormRow label="Asset Tag" required hint="Must be unique across the system">
                <input className="input t-mono" value={assetTag} onChange={e => setAssetTag(e.target.value.toUpperCase())}
                  placeholder="VIA-LT-001" required />
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
                  {COND_OPTIONS.map(v =>
                    <option key={v} value={v}>{ASSET_CONDITION_LABEL[v]}</option>)}
                </select>
              </FormRow>

              <FormRow label="Status" required>
                <select className="select" value={status}
                  onChange={e => setStatus(e.target.value as AssetStatus)} required>
                  {STATUS_OPTIONS.map(v =>
                    <option key={v} value={v}>{ASSET_STATUS_LABEL[v]}</option>)}
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
                {OS_OPTIONS[type].length > 0 ? (
                  <select className="select" value={os} onChange={e => setOs(e.target.value)}>
                    <option value="">Select OS…</option>
                    {OS_OPTIONS[type].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input className="input" value={os} onChange={e => setOs(e.target.value)}
                    placeholder="Windows 11 Pro" />
                )}
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
              onClick={() => router.push(`/assets/${id}`)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

        </div>
      </form>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function EditAssetPage() {
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
      <EditAssetContent id={params.id} />
    </AppShell>
  )
}
