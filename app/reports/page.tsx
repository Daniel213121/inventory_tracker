'use client'
import { Loading } from '@/components/ui/Loading'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '../../components/layout/AppShell'
import { ReportsContent } from '../../components/report/ReportsContent'

export default function ReportsPage() {
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
      <ReportsContent />
    </AppShell>
  )
}
