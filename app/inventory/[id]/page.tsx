'use client'

import { useEffect, useState }               from 'react'
import { useParams, useRouter }              from 'next/navigation'
import { AppShell }                          from '../../../components/layout/AppShell'
import { PageHeader }                        from '../../../components/ui/PageHeader'
import { SectionTitle }                      from '../../../components/ui/SectionTitle'
import { EmptyState }                        from '../../../components/ui/EmptyState'
import { ConditionBadge, MovementBadge }     from '../../../components/ui/badges'
import { Loading }                           from '@/components/ui/Loading'
import { Icon }                              from '../../../components/icons/Icon'
import { fmtDate, CONDITION_LABEL }          from '../../../lib/utils'
import { getInventoryItem }                  from '@/app/actions/inventory'
import { listMovements }                     from '@/app/actions/movements'
import { getCompany }                        from '@/app/actions/settings'
import type { InventoryItem, Movement }      from '../../../lib/types'

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="t-label" style={{ fontSize: 11, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14 }}>{children}</div>
    </div>
  )
}

function ConditionBreakdown({ item }: { item: InventoryItem }) {
  const rows = [
    { cond: 'NEW'    as const, qty: item.qtyNew    },
    { cond: 'USED'   as const, qty: item.qtyUsed   },
    { cond: 'FAULTY' as const, qty: item.qtyFaulty },
  ].filter(r => r.qty > 0)

  if (rows.length === 0) return <span className="muted">—</span>

  return (
    <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
      {rows.map(({ cond, qty }) => (
        <span key={cond} className="row gap-1" style={{ alignItems: 'center' }}>
          <ConditionBadge value={cond} />
          {!item.isSerialised && (
            <span className="muted" style={{ fontSize: 12 }}>×{qty}</span>
          )}
        </span>
      ))}
    </div>
  )
}

function InventoryDetail({ id }: { id: string }) {
  const router = useRouter()

  const [item,      setItem]      = useState<InventoryItem | null>(null)
  const [company,   setCompany]   = useState<{ name: string; code: string } | null>(null)
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      const fetched = await getInventoryItem(id)
      if (!fetched) { setLoading(false); return }

      const [co, movResult] = await Promise.all([
        getCompany(fetched.companyId),
        listMovements({ itemId: id, pageSize: 100 }),
      ])

      setItem(fetched as InventoryItem)
      setCompany(co ? { name: co.name, code: co.code } : null)
      setMovements(movResult.movements as Movement[])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <Loading />
      </div>
    )
  }

  if (!item) {
    return <EmptyState icon="package" title="Item not found" message="This item doesn't exist in inventory." />
  }

  const isLow        = item.quantity < item.threshold
  const firstSerial  = item.serialUnits[0]?.serial

  return (
    <div>
      <PageHeader
        title={item.name}
        breadcrumb={
          <>
            <span onClick={() => router.push('/inventory')} style={{ cursor: 'pointer' }}>Inventory</span>
            <Icon name="chevronRight" size={12} />
            <span className="t-mono">{firstSerial ?? item.name}</span>
          </>
        }
        actions={
          <>
            <button
              className="btn btn-secondary btn-sm row gap-2"
              onClick={() => router.push(`/inventory/${id}/edit`)}
            >
              <Icon name="edit" size={15} /> Edit
            </button>
            <button
              className="btn btn-primary btn-sm row gap-2"
              onClick={() => router.push(`/movements/stock-out?item=${id}`)}
            >
              <Icon name="arrowUp" size={15} /> Stock Out
            </button>
          </>
        }
      />

      {/* ── 2-col layout ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Left: details card */}
        <div className="card" style={{ padding: 24 }}>
          <SectionTitle>Item details</SectionTitle>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, rowGap: 24 }}>
            <KV label="Company">
              <div>{company?.name ?? <span className="muted">—</span>}</div>
              <div className="muted" style={{ fontSize: 12 }}>{company?.code}</div>
            </KV>
            <KV label="Category">{item.category.label}</KV>
            <KV label="Condition"><ConditionBreakdown item={item} /></KV>
            <KV label="Brand">{item.brand}</KV>
            <KV label="Model">{item.model}</KV>
            <KV label="Tracked by">
              {item.isSerialised
                ? <span style={{ fontSize: 13 }}>Serial numbers</span>
                : <span className="muted">Quantity only</span>
              }
            </KV>
            <KV label="Supplier">{item.supplier || '—'}</KV>
            <KV label="Purchase Date">{fmtDate(item.purchaseDate)}</KV>
            <KV label="Last Updated">{fmtDate(item.updated)}</KV>
          </div>

          {/* Bottom section */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {item.description
                  ? <KV label="Description">{item.description}</KV>
                  : <KV label="Description"><span className="muted">—</span></KV>
                }
                {item.notes
                  ? <KV label="Internal Notes">{item.notes}</KV>
                  : <KV label="Internal Notes"><span className="muted">—</span></KV>
                }
              </div>

              {/* Quantity + Threshold */}
              <div style={{
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
                padding: '12px 16px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <div className="t-label" style={{ fontSize: 11 }}>In Stock</div>
                <div style={{
                  fontSize: 42, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em',
                  color: isLow ? 'var(--error)' : 'var(--text)',
                }}>
                  {item.quantity}
                </div>
                <div className="muted" style={{ fontSize: 12 }}>Threshold: {item.threshold}</div>
                {isLow && (
                  <div className="row gap-1" style={{
                    padding: '4px 8px', background: '#fef2f2', borderRadius: 6,
                    color: 'var(--error)', fontSize: 11, fontWeight: 500,
                  }}>
                    <Icon name="alert" size={12} stroke="var(--error)" />
                    Low stock
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: item image */}
        {item.imageUrl
          ? (
            <div className="card" style={{ overflow: 'hidden', padding: 0, minHeight: 260 }}>
              <img src={item.imageUrl} alt={item.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          ) : (
            <div className="card" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 12, minHeight: 260,
              background: 'var(--bg)', border: '2px dashed var(--border)', borderRadius: 12,
            }}>
              <Icon name="package" size={40} stroke="var(--border)" />
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>No image</div>
              <div className="muted" style={{ fontSize: 12, textAlign: 'center', maxWidth: 160 }}>
                Add an image by editing this item
              </div>
            </div>
          )
        }
      </div>

      {/* ── Serial units ──────────────────────────────────────────────── */}
      {item.isSerialised && item.serialUnits.length > 0 && (
        <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
          <div className="row" style={{ justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div className="t-h3">Serial Numbers</div>
            <div className="muted" style={{ fontSize: 13 }}>
              {item.serialUnits.filter(u => u.status === 'IN_STOCK').length} in stock
              {item.serialUnits.some(u => u.status === 'DISPATCHED') && (
                <> · {item.serialUnits.filter(u => u.status === 'DISPATCHED').length} out</>
              )}
            </div>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {item.serialUnits.map(u => (
              <div key={u.id} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px',
                borderRadius: 6,
                background: u.status === 'DISPATCHED' ? '#f9fafb' : 'var(--bg)',
                border: `1px solid ${u.status === 'DISPATCHED' ? '#e5e7eb' : 'var(--border)'}`,
                opacity: u.status === 'DISPATCHED' ? 0.65 : 1,
              }}>
                <span style={{
                  fontSize: 13, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.01em',
                }}>
                  {u.serial}
                </span>
                <ConditionBadge value={u.condition} />
                {u.status === 'DISPATCHED' && (
                  <span className="muted" style={{ fontSize: 11 }}>out</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Movement history ──────────────────────────────────────────── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="row" style={{ justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="t-h3">Movement History</div>
          <div className="muted" style={{ fontSize: 13 }}>{movements.length} record{movements.length !== 1 ? 's' : ''}</div>
        </div>

        {movements.length === 0 ? (
          <EmptyState icon="history" title="No movements yet" message="Stock-in or stock-out activity will appear here." />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Condition</th>
                <th>Supplied To</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {movements.map(m => (
                <tr key={m.id}>
                  <td style={{ fontSize: 13 }}>{fmtDate(m.movedAt)}</td>
                  <td><MovementBadge type={m.type} /></td>
                  <td style={{ fontWeight: 600 }}>{m.quantity}</td>
                  <td style={{ fontSize: 13 }}>
                    {m.condBefore && m.condAfter
                      ? <>{CONDITION_LABEL[m.condBefore]} <span className="muted">→</span> {CONDITION_LABEL[m.condAfter]}</>
                      : m.condAfter
                        ? CONDITION_LABEL[m.condAfter]
                        : <span className="muted">—</span>
                    }
                  </td>
                  <td style={{ fontSize: 13 }}>{m.suppliedTo || '—'}</td>
                  <td className="muted" style={{ fontSize: 13 }}>{m.movedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default function InventoryDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('auth_user')
    if (!stored) { router.push('/login'); return }
    setUser(JSON.parse(stored))
  }, [router])

  if (!user) return <Loading />

  return (
    <AppShell user={user} onLogout={() => { localStorage.removeItem('auth_user'); router.push('/login') }}>
      <InventoryDetail id={id} />
    </AppShell>
  )
}
