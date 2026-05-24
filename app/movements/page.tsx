'use client'
import { Loading } from '@/components/ui/Loading'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell }          from '../../components/layout/AppShell'
import { PageHeader }        from '../../components/ui/PageHeader'
import { MovementsFilters }  from '../../components/movement/MovementsFilters'
import { MovementsTable }    from '../../components/movement/MovementsTable'
import { Icon }              from '../../components/icons/Icon'
import { MOVEMENTS, ITEM_BY_ID } from '../../lib/data'

const sorted = [...MOVEMENTS].sort(
  (a, b) => new Date(b.movedAt).getTime() - new Date(a.movedAt).getTime()
)

function MovementsContent() {
  const router = useRouter()
  const [q, setQ]             = useState('')
  const [type, setType]       = useState('all')
  const [company, setCompany] = useState('all')

  const filtered = useMemo(() => {
    const ql = q.toLowerCase()
    return sorted.filter(m => {
      if (type !== 'all' && m.type !== type) return false
      if (company !== 'all' && m.companyId !== company) return false
      if (ql) {
        const item = ITEM_BY_ID[m.itemId]
        const text = `${item?.name} ${item?.serial} ${m.suppliedTo} ${m.driverName}`.toLowerCase()
        if (!text.includes(ql)) return false
      }
      return true
    })
  }, [q, type, company])

  return (
    <div>
      <PageHeader
        title="Movements"
        subtitle="Every stock-in and stock-out across both companies"
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
          q={q}           onQ={setQ}
          type={type}     onType={setType}
          company={company} onCompany={setCompany}
        />
        <MovementsTable movements={filtered} />
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
