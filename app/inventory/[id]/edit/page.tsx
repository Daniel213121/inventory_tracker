'use client'
import { Loading } from '@/components/ui/Loading'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppShell }  from '../../../../components/layout/AppShell'
import { ItemForm }  from '../../../../components/inventory/ItemForm'
import { EmptyState } from '../../../../components/ui/EmptyState'
import { ITEM_BY_ID } from '../../../../lib/data'

export default function EditInventoryPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('auth_user')
    if (!stored) { router.push('/login'); return }
    setUser(JSON.parse(stored))
  }, [router])

  if (!user) return <Loading />

  const existing = ITEM_BY_ID[id]

  return (
    <AppShell
      user={user}
      onLogout={() => { localStorage.removeItem('auth_user'); router.push('/login') }}
    >
      {!existing
        ? <EmptyState icon="package" title="Item not found" message="This item doesn't exist in inventory." />
        : <ItemForm mode="edit" existing={existing} />
      }
    </AppShell>
  )
}
