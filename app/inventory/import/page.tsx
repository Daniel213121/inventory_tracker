'use client'
import { Loading } from '@/components/ui/Loading'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { AppShell }       from '../../../components/layout/AppShell'
import { PageHeader }     from '../../../components/ui/PageHeader'
import { Button }         from '@/components/ui/button'
import { Icon }           from '../../../components/icons/Icon'
import { ImportUpload }   from '../../../components/inventory/ImportUpload'
import { ImportPreview, type ImportRow } from '../../../components/inventory/ImportPreview'
import { listCompanies }  from '@/app/actions/settings'
import { listCategories, importInventoryItems } from '@/app/actions/inventory'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

/* ─── Template columns ────────────────────────────────────────────────── */

const TEMPLATE_COLUMNS = [
  'Name', 'Brand', 'Model', 'Serial Number', 'Category',
  'Condition (NEW/USED/FAULTY)', 'Quantity', 'Low Stock Threshold',
  'Supplier', 'Purchase Date (YYYY-MM-DD)', 'Description', 'Notes',
]

const SAMPLE_ROWS = [
  // Multiple serials for one item — comma-separated in the Serial Number cell
  ['Logitech MK540 Keyboard', 'Logitech', 'MK540 Advanced', 'LGT-MK540-001, LGT-MK540-002, LGT-MK540-003', 'PERIPHERAL', 'NEW', '', 5, 'Persol Systems', '2026-05-22', 'Wireless keyboard + mouse combo', ''],
  // Single serial item
  ['Samsung 870 EVO 1TB', 'Samsung', 'MZ-77E1T0B/AM', 'SAM-870-001', 'SSD', 'NEW', '', 2, 'Compu-Ghana Ltd', '2026-05-22', '2.5" SATA III SSD', ''],
]

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_COLUMNS, ...SAMPLE_ROWS])
  ws['!cols'] = TEMPLATE_COLUMNS.map(() => ({ wch: 22 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory')
  XLSX.writeFile(wb, 'inventory_import_template.xlsx')
}

/* ─── Parse + validate xlsx ───────────────────────────────────────────── */

function parseFile(
  file: File,
  knownCategories: { value: string; label: string }[],
): Promise<ImportRow[]> {
  const categoryValues = new Set(knownCategories.map(c => c.value.toUpperCase()))

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const wb   = XLSX.read(data, { type: 'array' })
        const ws   = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })

        const seenInFile = new Set<string>()

        const rows: ImportRow[] = json.map((raw, idx) => {
          const get = (key: string) => String(raw[key] ?? '').trim()
          const errors: string[] = []

          const name         = get('Name')
          const brand        = get('Brand')
          const model        = get('Model')
          const category     = get('Category').toUpperCase()
          const condition    = get('Condition (NEW/USED/FAULTY)').toUpperCase()
          const threshold    = parseInt(get('Low Stock Threshold')) || 5
          const supplier     = get('Supplier')
          const purchaseDate = get('Purchase Date (YYYY-MM-DD)')
          const description  = get('Description')
          const notes        = get('Notes')

          // Split comma-separated serials, uppercase + dedupe whitespace
          const serials = get('Serial Number')
            .split(',')
            .map(s => s.trim().toUpperCase())
            .filter(Boolean)

          // Quantity is derived from serial count; ignore the Quantity column for serialised items
          const quantity = serials.length > 0 ? serials.length : (parseInt(get('Quantity')) || 1)

          if (!name)    errors.push('Name is required')
          if (!brand)   errors.push('Brand is required')
          if (!model)   errors.push('Model is required')
          if (serials.length === 0)                             errors.push('At least one serial is required')
          if (!category)                                        errors.push('Category is required')
          else if (!categoryValues.has(category))              errors.push(`Unknown category "${category}"`)
          if (!['NEW', 'USED', 'FAULTY'].includes(condition)) errors.push('Condition must be NEW, USED or FAULTY')

          // Check each serial for duplicates within the file
          for (const s of serials) {
            if (seenInFile.has(s.toLowerCase())) {
              errors.push(`Duplicate serial in file: ${s}`)
            } else {
              seenInFile.add(s.toLowerCase())
            }
          }

          return { _row: idx + 2, name, brand, model, serials, category, condition, quantity, threshold, supplier, purchaseDate, description, notes, errors }
        })

        resolve(rows)
      } catch {
        reject(new Error('Could not read file. Make sure it is a valid .xlsx or .csv.'))
      }
    }
    reader.readAsArrayBuffer(file)
  })
}

/* ─── Import content ──────────────────────────────────────────────────── */

function ImportContent() {
  const router = useRouter()

  const [companies,   setCompanies]   = useState<{ id: string; name: string }[]>([])
  const [categories,  setCategories]  = useState<{ id: string; value: string; label: string }[]>([])
  const [companyId,   setCompanyId]   = useState('')
  const [step,        setStep]        = useState<'upload' | 'preview' | 'done'>('upload')
  const [filename,    setFilename]    = useState('')
  const [rows,        setRows]        = useState<ImportRow[]>([])
  const [importing,   setImporting]   = useState(false)

  useEffect(() => {
    Promise.all([listCompanies(), listCategories()]).then(([cos, cats]) => {
      setCompanies(cos)
      setCategories(cats)
      if (cos.length > 0) setCompanyId(cos[0].id)
    })
  }, [])

  const validRows   = rows.filter(r => r.errors.length === 0)
  const invalidRows = rows.length - validRows.length

  const handleFile = async (file: File) => {
    setFilename(file.name)
    try {
      const parsed = await parseFile(file, categories)
      setRows(parsed)
      setStep('preview')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to parse file')
    }
  }

  const handleImport = async () => {
    if (validRows.length === 0 || !companyId) return
    setImporting(true)

    const categoryMap = Object.fromEntries(categories.map(c => [c.value.toUpperCase(), c.id]))

    try {
      const mapped = validRows.map(row => ({
        companyId,
        categoryId:   categoryMap[row.category.toUpperCase()] ?? '',
        name:         row.name,
        brand:        row.brand,
        model:        row.model,
        isSerialised: true,
        serials:      row.serials,
        condition:    row.condition,
        quantity:     row.serials.length,
        threshold:    row.threshold,
        supplier:     row.supplier || undefined,
        purchaseDate: row.purchaseDate || new Date().toISOString().slice(0, 10),
        description:  row.description || undefined,
        notes:        row.notes || undefined,
      }))

      const result = await importInventoryItems(mapped, filename, companyId)
      toast.success(`${result.count} item${result.count !== 1 ? 's' : ''} imported successfully`, {
        description: `From file: ${filename}`,
      })
      setStep('done')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const breadcrumb = (
    <>
      <span onClick={() => router.push('/inventory')} style={{ cursor: 'pointer' }}>Inventory</span>
      <Icon name="chevronRight" size={12} />
      Import from Excel
    </>
  )

  if (step === 'done') {
    return (
      <div>
        <PageHeader title="Import Complete" breadcrumb={breadcrumb} />
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
            <Icon name="check" size={30} stroke="#16A34A" />
          </div>
          <div className="t-h3" style={{ marginBottom: 8 }}>{validRows.length} items imported</div>
          <div className="muted" style={{ fontSize: 14, marginBottom: 28 }}>
            They are now available in your inventory.
          </div>
          <div className="row gap-3" style={{ justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => { setStep('upload'); setRows([]) }}>
              Import another file
            </button>
            <Button onClick={() => router.push('/inventory')}
              style={{ background: 'var(--secondary)', color: '#fff' }}>
              Go to Inventory
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Import from Excel"
        breadcrumb={breadcrumb}
        actions={
          <button className="btn btn-secondary btn-sm row gap-2" onClick={downloadTemplate}>
            <Icon name="download" size={15} /> Download Template
          </button>
        }
      />

      <div className="col gap-4">

        {/* Company + instructions */}
        <div className="card" style={{ padding: 24 }}>
          <div className="row gap-4" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div className="t-h3" style={{ marginBottom: 6 }}>Before you start</div>
              <div className="muted" style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>
                Download the template, fill it in, then upload. Only valid rows will be imported.
              </div>
              <div style={{
                background: '#eff6ff', border: '1px solid #bfdbfe',
                borderRadius: 8, padding: '10px 14px', fontSize: 13,
              }}>
                <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>Tip — multiple serials for one item:</span>
                <span className="muted"> put all serial numbers in one cell, separated by commas (e.g. <span className="t-mono">CAM-001, CAM-002, CAM-003</span>). Each row becomes one inventory item. The template shows an example.</span>
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

        {/* Upload zone */}
        {step === 'upload' && (
          <div className="card" style={{ padding: 24 }}>
            <ImportUpload onFile={handleFile} />
          </div>
        )}

        {/* Preview */}
        {step === 'preview' && (
          <div className="card" style={{ padding: 24 }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="t-h3">{filename}</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                  {rows.length} rows parsed
                  {invalidRows > 0 && ` · ${invalidRows} with errors (will be skipped)`}
                </div>
              </div>
              <div className="row gap-2">
                <button className="btn btn-secondary btn-sm" onClick={() => { setStep('upload'); setRows([]) }}>
                  ← Change file
                </button>
                <Button
                  onClick={handleImport}
                  disabled={importing || validRows.length === 0}
                  style={{ background: 'var(--secondary)', color: '#fff' }}
                >
                  {importing
                    ? 'Importing…'
                    : `Import ${validRows.length} item${validRows.length !== 1 ? 's' : ''}`
                  }
                </Button>
              </div>
            </div>

            <ImportPreview rows={rows} />
          </div>
        )}

      </div>
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────── */

export default function ImportPage() {
  const router  = useRouter()
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('auth_user')
    if (!stored) { router.push('/login'); return }
    setUser(JSON.parse(stored))
  }, [router])

  if (!user) return <Loading />

  return (
    <AppShell user={user} onLogout={() => { localStorage.removeItem('auth_user'); router.push('/login') }}>
      <ImportContent />
    </AppShell>
  )
}
