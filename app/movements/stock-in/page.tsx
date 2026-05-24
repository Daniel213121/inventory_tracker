'use client'
import { Loading } from '@/components/ui/Loading'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AppShell }   from '../../../components/layout/AppShell'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Icon }       from '../../../components/icons/Icon'
import { Button }     from '@/components/ui/button'

import { StockInFilters }                   from '../../../components/movement/StockInFilters'
import { StockInWaybillList }               from '../../../components/movement/StockInWaybillList'
import type { WaybillGroup }                from '../../../components/movement/StockInWaybillList'
import { StockInReturnPanel }               from '../../../components/movement/StockInReturnPanel'

import { listCompanies }                    from '@/app/actions/settings'
import { listDispatchedItems, stockIn }     from '@/app/actions/movements'
import type { ConditionValue }              from '../../../lib/types'

function StockInForm() {
  const router = useRouter()

  const [companies,        setCompanies]        = useState<{ id: string; name: string }[]>([])
  const [companyId,        setCompanyId]        = useState('')
  const [date,             setDate]             = useState(new Date().toISOString().slice(0, 10))
  const [search,           setSearch]           = useState('')
  const [waybillGroups,    setWaybillGroups]    = useState<WaybillGroup[]>([])
  const [loadingGroups,    setLoadingGroups]    = useState(false)
  const [expandedWaybills, setExpandedWaybills] = useState<Set<string>>(new Set())
  const [selectedId,       setSelectedId]       = useState<string | null>(null)

  // Serialised: per-serial condition
  const [returningSerials, setReturningSerials] = useState<{ serial: string; condition: ConditionValue }[]>([])
  // Non-serialised: qty + single condition
  const [returningQty,     setReturningQty]     = useState(1)
  const [condition,        setCondition]        = useState<ConditionValue>('USED')

  const [driverName, setDriverName] = useState('')
  const [notes,      setNotes]      = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    listCompanies().then(cos => {
      setCompanies(cos.map(c => ({ id: c.id, name: c.name })))
      if (cos.length > 0) setCompanyId(cos[0].id)
    })
  }, [])

  useEffect(() => {
    if (!companyId) return
    setLoadingGroups(true)
    listDispatchedItems(companyId)
      .then(groups => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setWaybillGroups(groups as any)
        setExpandedWaybills(new Set(groups.map(g => g.waybillId)))
      })
      .finally(() => setLoadingGroups(false))
  }, [companyId])

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return waybillGroups
    const q = search.toLowerCase()
    return waybillGroups
      .map(group => {
        const headerMatch =
          group.waybillNumber.toLowerCase().includes(q) ||
          group.suppliedTo.toLowerCase().includes(q)
        const filtered = group.movements.filter(m =>
          m.itemName?.toLowerCase().includes(q) ||
          (m.serialsDispatched ?? []).some(s => s.toLowerCase().includes(q))
        )
        if (headerMatch) return group
        if (filtered.length > 0) return { ...group, movements: filtered }
        return null
      })
      .filter((g): g is WaybillGroup => g !== null)
  }, [waybillGroups, search])

  const allMovements     = filteredGroups.flatMap(g => g.movements)
  const selectedMovement = allMovements.find(m => m.id === selectedId) ?? null

  const dispatchedSerials  = selectedMovement?.serialsDispatched ?? []
  const isSerialisedReturn = !!(selectedMovement?.itemIsSerialised && dispatchedSerials.length > 0)
  const effectiveQty       = isSerialisedReturn ? returningSerials.length : returningQty

  const handleToggleSerial = (serial: string) => {
    setReturningSerials(prev => {
      const exists = prev.find(r => r.serial === serial)
      if (exists) return prev.filter(r => r.serial !== serial)
      return [...prev, { serial, condition: 'USED' }]
    })
  }

  const handleSerialCondition = (serial: string, cond: ConditionValue) => {
    setReturningSerials(prev => prev.map(r => r.serial === serial ? { ...r, condition: cond } : r))
  }

  const handleSelectRow = (id: string) => {
    setSelectedId(prev => prev === id ? null : id)
    setReturningSerials([])
    setReturningQty(1)
    setCondition('USED')
    setDriverName('')
    setNotes('')
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

  const canSubmit = selectedId !== null && effectiveQty >= 1 && driverName.trim().length > 0

  const handleSubmit = async () => {
    if (!canSubmit || !selectedMovement) return
    setSubmitting(true)
    try {
      await stockIn({
        itemId:       selectedMovement.itemId,
        isSerialised: isSerialisedReturn,
        ...(isSerialisedReturn
          ? { serialReturns: returningSerials }
          : { quantity: effectiveQty, condAfter: condition, condBefore: selectedMovement.condAfter ?? undefined }
        ),
        suppliedTo: selectedMovement.suppliedTo,
        driverName: driverName.trim(),
        notes:      notes.trim() || undefined,
        date:       date || undefined,
      })
      toast.success('Return recorded', {
        description: `${effectiveQty} × ${selectedMovement.itemName} returned`,
      })
      router.push('/movements')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Stock in failed')
    } finally {
      setSubmitting(false)
    }
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
          companies={companies}
          onCompany={handleCompanyChange}
          onDate={setDate}
          onSearch={setSearch}
        />

        {loadingGroups ? (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <div className="muted" style={{ fontSize: 14 }}>Loading dispatched items…</div>
          </div>
        ) : (
          <StockInWaybillList
            waybillGroups={filteredGroups}
            selectedId={selectedId}
            expandedWaybills={expandedWaybills}
            onSelectRow={handleSelectRow}
            onToggleWaybill={handleToggleWaybill}
          />
        )}

        <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => router.push('/movements')}>
            Cancel
          </button>
        </div>

        {/* Backdrop */}
        {selectedMovement && (
          <div
            onClick={() => handleSelectRow(selectedMovement.id)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 40 }}
          />
        )}

        {/* Slide-over panel */}
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 480,
          background: '#fff',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          zIndex: 50,
          display: 'flex', flexDirection: 'column',
          transform: selectedMovement ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
          overflowY: 'auto',
        }}>
          {selectedMovement && (
            <>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div className="t-h3" style={{ margin: 0 }}>Record Return</div>
                <button className="btn btn-ghost btn-sm"
                  onClick={() => handleSelectRow(selectedMovement.id)}
                  style={{ padding: '4px 8px' }}>
                  <Icon name="x" size={16} />
                </button>
              </div>

              <div style={{ padding: 20, flex: 1 }}>
                <StockInReturnPanel
                  movement={selectedMovement}
                  returningSerials={returningSerials}
                  onToggleSerial={handleToggleSerial}
                  onSerialCondition={handleSerialCondition}
                  returningQty={returningQty}
                  condition={condition}
                  onQtyChange={setReturningQty}
                  onCondition={setCondition}
                  driverName={driverName}
                  notes={notes}
                  onDriverName={setDriverName}
                  onNotes={setNotes}
                />
              </div>

              <div style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--border)',
                display: 'flex', gap: 8, justifyContent: 'flex-end',
              }}>
                <button type="button" className="btn btn-secondary"
                  onClick={() => handleSelectRow(selectedMovement.id)}>
                  Cancel
                </button>
                <Button onClick={handleSubmit} disabled={!canSubmit || submitting}
                  style={{ background: 'var(--secondary)', color: '#fff' }}>
                  <Icon name="arrowDown" size={15} />
                  {submitting ? 'Saving…' : 'Record Return'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

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
