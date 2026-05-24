'use client'
import { Loading } from '@/components/ui/Loading'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell, useTweaksContext } from '../../components/layout/AppShell'
import { PageHeader }          from '../../components/ui/PageHeader'
import { DashboardStats }      from '../../components/dashboard/DashboardStats'
import { RecentMovementsCard } from '../../components/dashboard/RecentMovementsCard'
import { StockChartCard }      from '../../components/dashboard/StockChartCard'
import { getDashboardData }    from '../actions/dashboard'
import type { DashboardData }  from '../actions/dashboard'

/* ─── Layout variants ──────────────────────────────────────────────────── */

function DashboardContent({ data }: { data: DashboardData }) {
  const tweaks = useTweaksContext()

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of inventory across VSA and VIA"
      />

      <DashboardStats
        totalItems={data.totalItems}
        itemsOut={data.itemsOut}
        waybillCount={data.waybillCount}
      />

      {tweaks.dashLayout === 'split' && (
        <div className="col gap-4">
          <StockChartCard companies={data.companies} categories={data.categories} inventory={data.inventory} />
          <RecentMovementsCard movements={data.recentMovements} />
        </div>
      )}

      {tweaks.dashLayout === 'wide' && (
        <div className="col gap-4">
          <StockChartCard companies={data.companies} categories={data.categories} inventory={data.inventory} />
          <RecentMovementsCard movements={data.recentMovements} />
        </div>
      )}

      {tweaks.dashLayout === 'thirds' && (
        <div className="col gap-4">
          <StockChartCard companies={data.companies} categories={data.categories} inventory={data.inventory} />
          <RecentMovementsCard compact movements={data.recentMovements} />
        </div>
      )}
    </div>
  )
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser]     = useState<{ id: string; name: string; email: string } | null>(null)
  const [data, setData]     = useState<DashboardData | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('auth_user')
    if (!stored) { router.push('/login'); return }
    setUser(JSON.parse(stored))
    getDashboardData().then(setData)
  }, [router])

  if (!user || !data) return <Loading />

  return (
    <AppShell
      user={user}
      onLogout={() => {
        localStorage.removeItem('auth_user')
        router.push('/login')
      }}
    >
      <DashboardContent data={data} />
    </AppShell>
  )
}
