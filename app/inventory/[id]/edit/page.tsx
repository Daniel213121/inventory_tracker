'use client'

import { useEffect, useState }    from 'react'
import { useParams, useRouter }   from 'next/navigation'
import { AppShell }               from '../../../../components/layout/AppShell'
import { ItemForm }               from '../../../../components/inventory/ItemForm'
import { EmptyState }             from '../../../../components/ui/EmptyState'
import { Loading }                from '@/components/ui/Loading'
import { getInventoryItem }       from '@/app/actions/inventory'
import type { InventoryItem }     from '../../../../lib/types'

export default function EditInventoryPage() {
  const router  = useRouter()
  const { id }  = useParams<{ id: string }>()

  const [user,    setUser]    = useState<{ id: string; name: string; email: string } | null>(null)
  const [item,    setItem]    = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('auth_user')
    if (!stored) { router.push('/login'); return }
    setUser(JSON.parse(stored))
  }, [router])

  useEffect(() => {
    if (!id) return
    getInventoryItem(id).then(fetched => {
      setItem(fetched as InventoryItem | null)
      setLoading(false)
    })
  }, [id])

  if (!user || loading) return <Loading />

  if (!item) {
    return (
      <AppShell
        user={user}
        onLogout={() => { localStorage.removeItem('auth_user'); router.push('/login') }}
      >
        <EmptyState icon="package" title="Item not found" message="This item doesn't exist in inventory." />
      </AppShell>
    )
  }

  return (
    <AppShell
      user={user}
      onLogout={() => { localStorage.removeItem('auth_user'); router.push('/login') }}
    >
      <ItemForm mode="edit" existing={item} />
    </AppShell>
  )
}
