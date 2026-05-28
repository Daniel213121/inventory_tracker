'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter }                   from 'next/navigation'
import { toast }                       from 'sonner'
import { Loading }                     from '@/components/ui/Loading'
import { AppShell }                    from '@/components/layout/AppShell'
import { PageHeader }                  from '@/components/ui/PageHeader'
import { Button }                      from '@/components/ui/button'
import { Icon }                        from '@/components/icons/Icon'
import { ScanPreview, type ScannedItem } from '@/components/inventory/ScanPreview'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { listCompanies }               from '@/app/actions/settings'
import { listCategories, importInventoryItems, createCategory } from '@/app/actions/inventory'

const ACCEPTED = 'image/jpeg,image/png,image/webp,application/pdf'

/* ─── Upload zone ─────────────────────────────────────────────────────── */

function ScanUpload({ onFile }: { onFile: (f: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? 'var(--secondary)' : 'var(--border)'}`,
        borderRadius: 12,
        padding: '56px 32px',
        textAlign: 'center',
        cursor: 'pointer',
        background: dragging ? '#eff6ff' : 'var(--bg)',
        transition: 'all 0.15s',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: '#dbeafe', display: 'grid',
        placeItems: 'center', margin: '0 auto 20px',
      }}>
        <Icon name="document" size={30} stroke="#2563EB" />
      </div>

      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', marginBottom: 8 }}>
        Drop your invoice or packing list here
      </div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
        Supports JPEG, PNG, WebP, PDF — or click to browse
      </div>
      <span style={{
        display: 'inline-block', padding: '7px 20px',
        border: '1px solid var(--border)', borderRadius: 6,
        fontSize: 13, fontWeight: 500, color: 'var(--text)',
        background: '#fff',
      }}>
        Browse files
      </span>
    </div>
  )
}

/* ─── Scan content ────────────────────────────────────────────────────── */

function ScanContent() {
  const router = useRouter()

  const [companies,  setCompanies]  = useState<{ id: string; name: string }[]>([])
  const [categories, setCategories] = useState<{ id: string; value: string; label: string }[]>([])
  const [companyId,  setCompanyId]  = useState('')
  const [step,       setStep]       = useState<'upload' | 'scanning' | 'preview' | 'done'>('upload')
  const [items,      setItems]      = useState<ScannedItem[]>([])
  const [filename,   setFilename]   = useState('')
  const [saving,     setSaving]     = useState(false)

  useEffect(() => {
    Promise.all([listCompanies(), listCategories()]).then(([cos, cats]) => {
      setCompanies(cos)
      setCategories(cats)
      if (cos.length > 0) setCompanyId(cos[0].id)
    })
  }, [])

  const handleFile = async (file: File) => {
    setFilename(file.name)
    setStep('scanning')

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/scan-invoice', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Scan failed')
        setStep('upload')
        return
      }

      const extracted: ScannedItem[] = data.items

      // Keep the AI's category suggestion as-is — unknown ones will be created on save
      setItems(extracted)
      setStep('preview')
    } catch {
      toast.error('Could not reach the server. Please try again.')
      setStep('upload')
    }
  }

  const handleSave = async () => {
    if (items.length === 0 || !companyId) return

    const missingName = items.filter(item => !item.name)
    if (missingName.length > 0) {
      toast.error(`${missingName.length} item(s) are missing a name`)
      return
    }
    const missingCat = items.filter(item => !item.category)
    if (missingCat.length > 0) {
      toast.error(`${missingCat.length} item(s) have no category — select one or the AI suggestion will be used`)
      return
    }

    setSaving(true)

    try {
      const categoryMap = Object.fromEntries(categories.map(c => [c.value.toUpperCase(), c.id]))

      // Find categories suggested by AI that don't exist in the DB yet
      const unknownLabels = [...new Set(
        items
          .map(item => item.category.toUpperCase())
          .filter(val => val && !categoryMap[val])
      )]

      // Create new categories and add to the map
      if (unknownLabels.length > 0) {
        const created = await Promise.all(
          unknownLabels.map(val =>
            createCategory(val.charAt(0) + val.slice(1).toLowerCase())
          )
        )
        created.forEach(cat => { categoryMap[cat.value.toUpperCase()] = cat.id })
        setCategories(prev => [...prev, ...created])
      }

      const rows = items.map(item => ({
        companyId,
        categoryId:   categoryMap[item.category.toUpperCase()] ?? '',
        name:         item.name,
        brand:        item.brand || item.name,
        model:        item.model || '-',
        isSerialised: item.serials.length > 0,
        serials:      item.serials,
        condition:    item.condition,
        quantity:     item.serials.length > 0 ? item.serials.length : item.quantity,
        threshold:    item.threshold,
        supplier:     item.supplier || undefined,
        purchaseDate: item.purchaseDate,
        description:  item.description || undefined,
        notes:        undefined,
      }))

      const result = await importInventoryItems(rows, `scan:${filename}`, companyId)
      toast.success(`${result.count} item${result.count !== 1 ? 's' : ''} added to inventory`, {
        description: `Scanned from ${filename}`,
      })
      setStep('done')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const breadcrumb = (
    <>
      <span onClick={() => router.push('/inventory')} style={{ cursor: 'pointer' }}>Inventory</span>
      <Icon name="chevronRight" size={12} />
      Scan Invoice
    </>
  )

  /* ── Done ─────────────────────────────────────────────────────────── */
  if (step === 'done') {
    return (
      <div>
        <PageHeader title="Scan Complete" breadcrumb={breadcrumb} />
        <div className="card" style={{ padding: 56, textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#dcfce7', display: 'grid',
            placeItems: 'center', margin: '0 auto 20px',
          }}>
            <Icon name="check" size={30} stroke="#16A34A" />
          </div>
          <div className="t-h3" style={{ marginBottom: 8 }}>{items.length} items added to inventory</div>
          <div className="muted" style={{ fontSize: 14, marginBottom: 28 }}>
            They are now available in your inventory.
          </div>
          <div className="row gap-3" style={{ justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => { setStep('upload'); setItems([]) }}>
              Scan another document
            </button>
            <Button
              onClick={() => router.push('/inventory')}
              style={{ background: 'var(--secondary)', color: '#fff' }}
            >
              Go to Inventory
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Scan Invoice" breadcrumb={breadcrumb} />

      <div className="col gap-4">

        {/* Company selector + instructions */}
        <div className="card" style={{ padding: 24 }}>
          <div className="row gap-4" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div className="t-h3" style={{ marginBottom: 6 }}>AI-powered invoice scanning</div>
              <div className="muted" style={{ fontSize: 13, lineHeight: 1.7 }}>
                Upload a photo or scan of an invoice or packing list. The AI will extract all line items and prepare them for import. Review and edit the results before saving.
              </div>
            </div>
            <div style={{ minWidth: 220 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Import for company
              </label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#E5E7EB] shadow-md">
                  {companies.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Upload step */}
        {step === 'upload' && (
          <div className="card" style={{ padding: 24 }}>
            <ScanUpload onFile={handleFile} />
          </div>
        )}

        {/* Scanning step */}
        {step === 'scanning' && (
          <div className="card" style={{ padding: 56, textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              border: '3px solid var(--secondary)',
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 20px',
            }} />
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Analyzing document…</div>
            <div className="muted" style={{ fontSize: 13 }}>
              The AI is reading your invoice. This usually takes 5–15 seconds.
            </div>
          </div>
        )}

        {/* Preview step */}
        {step === 'preview' && (
          <div className="card" style={{ padding: 24 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="t-h3">{filename}</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                  {items.length} item{items.length !== 1 ? 's' : ''} extracted — review and edit before saving
                </div>
              </div>
              <div className="row gap-2">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => { setStep('upload'); setItems([]) }}
                >
                  ← Scan again
                </button>
                <Button
                  onClick={handleSave}
                  disabled={saving || items.length === 0}
                  style={{ background: 'var(--secondary)', color: '#fff' }}
                >
                  {saving
                    ? 'Saving…'
                    : `Save ${items.length} item${items.length !== 1 ? 's' : ''} to inventory`}
                </Button>
              </div>
            </div>

            {(() => {
              const knownValues   = new Set(categories.map(c => c.value.toUpperCase()))
              const emptyCount    = items.filter(i => !i.category).length
              const newCatCount   = items.filter(i => i.category && !knownValues.has(i.category.toUpperCase())).length
              return (
                <>
                  {emptyCount > 0 && (
                    <div style={{
                      background: '#fef2f2', border: '1px solid #fecaca',
                      borderRadius: 8, padding: '10px 14px',
                      fontSize: 13, marginBottom: 12,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <Icon name="alert" size={14} stroke="var(--error)" />
                      <span style={{ color: '#991b1b' }}>
                        {emptyCount} item{emptyCount !== 1 ? 's have' : ' has'} no category — select one before saving.
                      </span>
                    </div>
                  )}
                  {newCatCount > 0 && (
                    <div style={{
                      background: '#fffbeb', border: '1px solid #fde68a',
                      borderRadius: 8, padding: '10px 14px',
                      fontSize: 13, marginBottom: 12,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <Icon name="alert" size={14} stroke="#D97706" />
                      <span style={{ color: '#92400e' }}>
                        {newCatCount} new categor{newCatCount !== 1 ? 'ies' : 'y'} will be created automatically when you save.
                      </span>
                    </div>
                  )}
                </>
              )
            })()}

            <ScanPreview
              items={items}
              categories={categories}
              onChange={setItems}
            />
          </div>
        )}

      </div>
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────── */

export default function ScanPage() {
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
      <ScanContent />
    </AppShell>
  )
}
