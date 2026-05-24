'use client'
import { Loading } from '@/components/ui/Loading'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell, useTweaksContext } from '../../components/layout/AppShell'
import { PageHeader }          from '../../components/ui/PageHeader'
import { DashboardStats }      from '../../components/dashboard/DashboardStats'
import { RecentMovementsCard } from '../../components/dashboard/RecentMovementsCard'
import { StockChartCard }      from '../../components/dashboard/StockChartCard'

/* ─── Layout variants (reads tweaks from context) ──────────────────────── */

function DashboardContent() {
  const tweaks = useTweaksContext()

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of inventory across VSA and VIA"
      />

      <DashboardStats />

      {tweaks.dashLayout === 'split' && (
        <div className="col gap-4">
          <StockChartCard />
          <RecentMovementsCard />
        </div>
      )}

      {tweaks.dashLayout === 'wide' && (
        <div className="col gap-4">
          <StockChartCard />
          <RecentMovementsCard />
        </div>
      )}

      {tweaks.dashLayout === 'thirds' && (
        <div className="col gap-4">
          <StockChartCard />
          <RecentMovementsCard compact />
        </div>
      )}
    </div>
  )
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
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
      onLogout={() => {
        localStorage.removeItem('auth_user')
        router.push('/login')
      }}
    >
      <DashboardContent />
    </AppShell>
  )
}
