'use client'
import { Loading } from '@/components/ui/Loading'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AppShell }   from '../../../components/layout/AppShell'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Icon }       from '../../../components/icons/Icon'
import { Button }     from '@/components/ui/button'

import { StockInFilters }     from '../../../components/movement/StockInFilters'
import { StockInWaybillList, getDispatchedByWaybill } from '../../../components/movement/StockInWaybillList'
import { StockInReturnPanel } from '../../../components/movement/StockInReturnPanel'

import { COMPANIES, CONDITION_LABEL, ITEM_BY_ID, WAYBILL_BY_ID } from '../../../lib/data'
import type { ConditionValue } from '../../../lib/types'

/* ─── Main form ──────────────────────────────────────────────────────────── */
function StockInForm() {
  const router = useRouter()

  const [companyId, setCompanyId]               = useState('vsa')
  const [date, setDate]                         = useState('2026-05-22')
  const [search, setSearch]                     = useState('')
  const [expandedWaybills, setExpandedWaybills] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId]             = useState<string | null>(null)
  const [returningSerials, setReturningSerials] = useState<string[]>([])
  const [returningQty, setReturningQty]         = useState(1)
  const [condition, setCondition]               = useState<ConditionValue>('USED')

  const allWaybillGroups = useMemo(() => getDispatchedByWaybill(companyId), [companyId])

  const waybillGroups = useMemo(() => {
    if (!search.trim()) return allWaybillGroups
    const q = search.toLowerCase()
    return allWaybillGroups
      .map(([waybillId, movements]) => {
        const waybill      = WAYBILL_BY_ID[waybillId]
        const waybillMatch = waybill?.number.toLowerCase().includes(q) || waybill?.suppliedTo.toLowerCase().includes(q)
        const filtered     = movements.filter(m => {
          const item = ITEM_BY_ID[m.itemId]
          return (
            item?.name.toLowerCase().includes(q) ||
            (m.serialsDispatched ?? []).some(s => s.toLowerCase().includes(q))
          )
        })
        if (waybillMatch) return [waybillId, movements] as [string, typeof movements]
        if (filtered.length > 0) return [waybillId, filtered] as [string, typeof movements]
        return null
      })
      .filter((g): g is [string, typeof allWaybillGroups[0][1]] => g !== null)
  }, [allWaybillGroups, search])

  const allMovements     = waybillGroups.flatMap(([, mvs]) => mvs)
  const selectedMovement = allMovements.find(m => m.id === selectedId) ?? null
  const selectedItem     = selectedMovement ? ITEM_BY_ID[selectedMovement.itemId] : null
  const selectedWaybill  = selectedMovement?.waybillId ? WAYBILL_BY_ID[selectedMovement.waybillId] : null

  const dispatchedSerials  = selectedMovement?.serialsDispatched ?? []
  const isSerialisedReturn = !!(selectedItem?.isSerialised && dispatchedSerials.length > 0)
  const effectiveQty       = isSerialisedReturn ? returningSerials.length : returningQty

  const toggleSerial = (s: string) =>
    setReturningSerials(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const handleSelectRow = (id: string) => {
    setSelectedId(prev => prev === id ? null : id)
    setReturningSerials([])
    setReturningQty(1)
    setCondition('USED')
  }

  const handleToggleWaybill = (waybillId: string) =>
    setExpandedWaybills(prev => {
      const next = new Set(prev)
      next.has(waybillId) ? next.delete(waybillId) : next.add(waybillId)
      return next
    })

  const handleCompanyChange = (id: string) => {
    setCompanyId(id)
    setSelectedId(null)
    setReturningSerials([])
    setExpandedWaybills(new Set())
  }

  const canSubmit = selectedId !== null && effectiveQty >= 1

  const handleSubmit = () => {
    if (!canSubmit || !selectedItem) return
    const company = COMPANIES.find(c => c.id === companyId)
    toast.success('Return recorded', {
      description: `${effectiveQty} × ${selectedItem.name} returned to ${company?.code} — ${CONDITION_LABEL[condition]}`,
    })
    setTimeout(() => router.push('/movements'), 1400)
  }

  return (
    <div>
      <PageHeader
        title="Record Stock In"
        subtitle="Log items returning from a field deployment."
        breadcrumb={
          <>
            <span onClick={() => router.push('/movements')} style={{ cursor: 'pointer' }}>Movements</span>
            <Icon name="chevronRight" size={12} />
            Stock In
          </>
        }
      />

      <div className="col gap-4">
        <StockInFilters
          companyId={companyId}
          date={date}
          search={search}
          onCompany={handleCompanyChange}
          onDate={setDate}
          onSearch={setSearch}
        />

        <StockInWaybillList
          waybillGroups={waybillGroups}
          selectedId={selectedId}
          expandedWaybills={expandedWaybills}
          onSelectRow={handleSelectRow}
          onToggleWaybill={handleToggleWaybill}
        />

        <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => router.push('/movements')}>
            Cancel
          </button>
        </div>

        {/* Backdrop */}
        {selectedMovement && (
          <div
            onClick={() => handleSelectRow(selectedMovement.id)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.25)',
              zIndex: 40,
            }}
          />
        )}

        {/* Slide-over panel */}
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 420,
          background: '#fff',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          zIndex: 50,
          display: 'flex', flexDirection: 'column',
          transform: selectedMovement ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
          overflowY: 'auto',
        }}>
          {selectedMovement && selectedItem && (
            <>
              {/* Drawer header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div className="t-h3" style={{ margin: 0 }}>Record Return</div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleSelectRow(selectedMovement.id)}
                  style={{ padding: '4px 8px' }}
                >
                  <Icon name="x" size={16} />
                </button>
              </div>

              {/* Drawer body */}
              <div style={{ padding: 20, flex: 1 }}>
                <StockInReturnPanel
                  movement={selectedMovement}
                  item={selectedItem}
                  waybill={selectedWaybill}
                  returningSerials={returningSerials}
                  returningQty={returningQty}
                  condition={condition}
                  onToggleSerial={toggleSerial}
                  onQtyChange={setReturningQty}
                  onCondition={setCondition}
                />
              </div>

              {/* Drawer footer */}
              <div style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--border)',
                display: 'flex', gap: 8, justifyContent: 'flex-end',
              }}>
                <button type="button" className="btn btn-secondary"
                  onClick={() => handleSelectRow(selectedMovement.id)}>
                  Cancel
                </button>
                <Button onClick={handleSubmit} disabled={!canSubmit}
                  style={{ background: 'var(--secondary)', color: '#fff' }}>
                  <Icon name="arrowDown" size={15} />
                  Record Return
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Page wrapper ───────────────────────────────────────────────────────── */
export default function StockInPage() {
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
      <Suspense>
        <StockInForm />
      </Suspense>
    </AppShell>
  )
}
