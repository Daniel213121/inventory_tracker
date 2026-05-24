'use client'
import { Loading } from '@/components/ui/Loading'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { AppShell }          from '../../components/layout/AppShell'
import { PageHeader }        from '../../components/ui/PageHeader'
import { InventoryFilters }  from '../../components/inventory/InventoryFilters'
import { InventoryTable }    from '../../components/inventory/InventoryTable'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { INVENTORY, COMPANY_BY_ID } from '../../lib/data'
import type { InventoryItem } from '../../lib/types'

const PAGE_SIZE = 10

const totalQty = INVENTORY.reduce((s, i) => s + i.quantity, 0)

function InventoryContent() {
  const router = useRouter()
  const [q, setQ]           = useState('')
  const [company, setCompany] = useState('all')
  const [cat, setCat]       = useState('all')
  const [cond, setCond]     = useState('all')
  const [page, setPage]     = useState(1)

  const resetPage = (fn: (v: string) => void) => (v: string) => { fn(v); setPage(1) }

  const exportCSV = (items: InventoryItem[]) => {
    const rows = items.map(i => ({
      'Name':          i.name,
      'Brand':         i.brand,
      'Model':         i.model,
      'Serial Number': i.serial ?? '',
      'Category':      i.category.label,
      'Condition':     i.condition,
      'Quantity':      i.quantity,
      'Threshold':     i.threshold,
      'Supplier':      i.supplier,
      'Purchase Date': i.purchaseDate,
      'Company':       COMPANY_BY_ID[i.companyId]?.code ?? i.companyId,
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

  const filtered = useMemo(() => {
    const ql = q.toLowerCase()
    return INVENTORY.filter(i => {
      if (company !== 'all' && i.companyId !== company) return false
      if (cat  !== 'all' && i.categoryId !== cat)  return false
      if (cond !== 'all' && i.condition  !== cond) return false
      if (ql && !`${i.name} ${i.serial ?? ''} ${i.brand} ${i.model}`.toLowerCase().includes(ql)) return false
      return true
    })
  }, [q, company, cat, cond])

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle={`${INVENTORY.length} SKUs across both companies — ${totalQty.toLocaleString()} units total`}
        actions={
          <>
            <button className="btn btn-secondary btn-sm row gap-2" onClick={() => exportCSV(filtered)}>
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
          q={q}           onQ={resetPage(setQ)}
          company={company} onCompany={resetPage(setCompany)}
          cat={cat}       onCat={resetPage(setCat)}
          cond={cond}     onCond={resetPage(setCond)}
        />

        <InventoryTable items={paged} />

        {filtered.length > PAGE_SIZE && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="muted" style={{ fontSize: 13 }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
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
