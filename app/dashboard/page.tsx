'use client'
import { Loading } from '@/components/ui/Loading'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell, useTweaksContext } from '../../components/layout/AppShell'
import { PageHeader }          from '../../components/ui/PageHeader'
import { DashboardStats }      from '../../components/dashboard/DashboardStats'
import { RecentMovementsCard } from '../../components/dashboard/RecentMovementsCard'
import { StockChartCard }      from '../../components/dashboard/StockChartCard'
import { StatCard }            from '../../components/ui/StatCard'
import { getDashboardData }    from '../actions/dashboard'
import type { DashboardData }  from '../actions/dashboard'
import { ASSETS, ASSET_TRANSFERS } from '../../lib/data'

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard
          icon="monitor"
          label="Total Assets"
          value={ASSETS.length}
          sub="Laptops, phones, tablets, monitors"
        />
        <StatCard
          icon="user"
          label="Assets Assigned"
          value={ASSETS.filter(a => a.status === 'ASSIGNED').length}
          accent="#2563EB"
          sub="Currently with employees"
        />
        <StatCard
          icon="alert"
          label="Assets Unassigned"
          value={ASSETS.filter(a => a.status === 'AVAILABLE').length}
          accent="#D97706"
          sub="Available in store"
        />
        <StatCard
          icon="history"
          label="Transfers This Month"
          value={ASSET_TRANSFERS.length}
          accent="#16A34A"
          sub="Change of asset documents"
        />
      </div>

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
