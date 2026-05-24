'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter }         from 'next/navigation'
import { AppShell }          from '../../components/layout/AppShell'
import { PageHeader }        from '../../components/ui/PageHeader'
import { MovementsFilters }  from '../../components/movement/MovementsFilters'
import { MovementsTable }    from '../../components/movement/MovementsTable'
import { Icon }              from '../../components/icons/Icon'
import { Loading }           from '@/components/ui/Loading'
import { listMovements }     from '@/app/actions/movements'
import { listCompanies }     from '@/app/actions/settings'
import type { Movement }     from '../../lib/types'

const PAGE_SIZE = 20

function MovementsContent() {
  const router = useRouter()

  const [companies,  setCompanies]  = useState<{ id: string; name: string }[]>([])
  const [movements,  setMovements]  = useState<Movement[]>([])
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(1)
  const [loading,    setLoading]    = useState(true)
  const [q,          setQ]          = useState('')
  const [type,       setType]       = useState('all')
  const [company,    setCompany]    = useState('all')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    listCompanies().then(setCompanies)
  }, [])

  const fetch = useCallback((search: string, t: string, c: string, p: number) => {
    setLoading(true)
    listMovements({
      search:    search || undefined,
      type:      t !== 'all' ? t : undefined,
      companyId: c !== 'all' ? c : undefined,
      page:      p,
      pageSize:  PAGE_SIZE,
    }).then(res => {
      setMovements(res.movements as Movement[])
      setTotal(res.total)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetch(q, type, company, page), 300)
  }, [q, type, company, page, fetch])

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const handleQ = (v: string) => { setQ(v); setPage(1) }
  const handleType = (v: string) => { setType(v); setPage(1) }
  const handleCompany = (v: string) => { setCompany(v); setPage(1) }

  return (
    <div>
      <PageHeader
        title="Movements"
        subtitle="Every stock-in and stock-out across all companies"
        actions={
          <>
            <button className="btn btn-secondary btn-sm row gap-2" onClick={() => router.push('/movements/stock-in')}>
              <Icon name="arrowDown" size={15} /> Stock In
            </button>
            <button className="btn btn-primary btn-sm row gap-2" onClick={() => router.push('/movements/stock-out')}>
              <Icon name="arrowUp" size={15} /> Stock Out
            </button>
          </>
        }
      />

      <div className="card" style={{ overflow: 'visible' }}>
        <MovementsFilters
          q={q}             onQ={handleQ}
          type={type}       onType={handleType}
          company={company} onCompany={handleCompany}
          companies={companies}
        />

        {loading
          ? <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Loading /></div>
          : <MovementsTable movements={movements} />
        }

        {/* Pagination */}
        {pages > 1 && (
          <div className="row gap-3" style={{ justifyContent: 'center', padding: '16px 0', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <Icon name="chevronLeft" size={14} /> Prev
            </button>
            <span className="muted" style={{ fontSize: 13 }}>Page {page} of {pages}</span>
            <button className="btn btn-ghost btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>
              Next <Icon name="chevronRight" size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MovementsPage() {
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
      <MovementsContent />
    </AppShell>
  )
}
