'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter }                    from 'next/navigation'
import * as XLSX                        from 'xlsx'
import { AppShell }                     from '../../components/layout/AppShell'
import { PageHeader }                   from '../../components/ui/PageHeader'
import { InventoryFilters }             from '../../components/inventory/InventoryFilters'
import { InventoryTable }               from '../../components/inventory/InventoryTable'
import { Loading }                      from '@/components/ui/Loading'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { listInventory, listCategories } from '@/app/actions/inventory'
import { listCompanies }                 from '@/app/actions/settings'
import type { InventoryItem }            from '../../lib/types'

const PAGE_SIZE = 10

// ─── Inner content ────────────────────────────────────────────────────────────

function InventoryContent() {
  const router = useRouter()

  // ── Filter state ──
  const [q, setQ]             = useState('')
  const [company, setCompany] = useState('all')
  const [cat, setCat]         = useState('all')
  const [cond, setCond]       = useState('all')
  const [page, setPage]       = useState(1)

  // ── Data state ──
  const [items, setItems]     = useState<InventoryItem[]>([])
  const [total, setTotal]     = useState(0)
  const [pages, setPages]     = useState(1)
  const [loading, setLoading] = useState(true)

  // ── Reference data for filter dropdowns ──
  const [companies,  setCompanies]  = useState<{ id: string; name: string; code: string }[]>([])
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([])

  // Load companies + categories once on mount
  useEffect(() => {
    Promise.all([listCompanies(), listCategories()]).then(([cos, cats]) => {
      setCompanies(cos.map(c => ({ id: c.id, name: c.name, code: c.code })))
      setCategories(cats.map(c => ({ id: c.id, label: c.label })))
    })
  }, [])

  // Reload inventory when filters or page change; debounce the search field
  useEffect(() => {
    let cancelled = false
    const delay   = q ? 300 : 0

    setLoading(true)

    const timer = setTimeout(async () => {
      const result = await listInventory({
        companyId:  company !== 'all' ? company   : undefined,
        categoryId: cat     !== 'all' ? cat       : undefined,
        condition:  cond    !== 'all' ? cond      : undefined,
        search:     q       || undefined,
        page,
        pageSize:   PAGE_SIZE,
      })
      if (!cancelled) {
        setItems(result.items as InventoryItem[])
        setTotal(result.total)
        setPages(result.pages)
        setLoading(false)
      }
    }, delay)

    return () => { cancelled = true; clearTimeout(timer) }
  }, [q, company, cat, cond, page])

  // Reset to page 1 whenever a filter changes
  const resetPage = (fn: (v: string) => void) => (v: string) => { fn(v); setPage(1) }

  // Company map for CSV export
  const companyMap = useMemo(
    () => Object.fromEntries(companies.map(c => [c.id, c])),
    [companies],
  )

  const exportCSV = () => {
    const rows = items.map(i => ({
      'Name':          i.name,
      'Brand':         i.brand,
      'Model':         i.model,
      'Serial Number': i.serialUnits.map(u => u.serial).join(', '),
      'Category':      i.category.label,
      'Condition':     [i.qtyNew > 0 && 'New', i.qtyUsed > 0 && 'Used', i.qtyFaulty > 0 && 'Faulty'].filter(Boolean).join(', '),
      'Quantity':      i.quantity,
      'Threshold':     i.threshold,
      'Supplier':      i.supplier,
      'Purchase Date': i.purchaseDate,
      'Company':       companyMap[i.companyId]?.code ?? i.companyId,
      'Last Updated':  i.updated,
      'Description':   i.description,
      'Notes':         i.notes,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = Object.keys(rows[0] ?? {}).map(() => ({ wch: 20 }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory')
    XLSX.writeFile(wb, `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`)
  }

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle={
          loading
            ? 'Loading…'
            : `${total} SKU${total !== 1 ? 's' : ''} across both companies`
        }
        actions={
          <>
            <button className="btn btn-secondary btn-sm row gap-2" onClick={exportCSV}>
              Export CSV
            </button>
            <button
              className="btn btn-secondary btn-sm row gap-2"
              onClick={() => router.push('/inventory/import')}
            >
              Import Excel
            </button>
            <button
              className="btn btn-primary btn-sm row gap-2"
              onClick={() => router.push('/inventory/add')}
            >
              + Add New Item
            </button>
          </>
        }
      />

      <div className="card" style={{ overflow: 'visible' }}>
        <InventoryFilters
          q={q}             onQ={resetPage(setQ)}
          company={company} onCompany={resetPage(setCompany)}
          cat={cat}         onCat={resetPage(setCat)}
          cond={cond}       onCond={resetPage(setCond)}
          companies={companies}
          categories={categories}
        />

        {loading ? (
          <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
            <Loading />
          </div>
        ) : (
          <InventoryTable items={items} />
        )}

        {!loading && total > PAGE_SIZE && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="muted" style={{ fontSize: 13 }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </span>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      aria-disabled={page === 1}
                      className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(n => (
                    <PaginationItem key={n}>
                      <PaginationLink isActive={n === page} onClick={() => setPage(n)}>
                        {n}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(p => Math.min(pages, p + 1))}
                      aria-disabled={page === pages}
                      className={page === pages ? 'pointer-events-none opacity-50' : ''}
                    />
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

// ─── Page (auth guard) ────────────────────────────────────────────────────────

export default function InventoryPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('auth_user')
    if (!stored) { router.push('/login'); return }
    setUser(JSON.parse(stored))
  }, [router])

  if (!user) return <Loading />

  return (
    <AppShell
      user={user}
      onLogout={() => { localStorage.removeItem('auth_user'); router.push('/login') }}
    >
      <InventoryContent />
    </AppShell>
  )
}
