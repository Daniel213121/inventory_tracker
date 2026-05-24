'use client'
import { Loading } from '@/components/ui/Loading'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppShell }      from '../../../components/layout/AppShell'
import { PageHeader }    from '../../../components/ui/PageHeader'
import { SectionTitle }  from '../../../components/ui/SectionTitle'
import { EmptyState }    from '../../../components/ui/EmptyState'
import { CompanyChip }   from '../../../components/ui/CompanyChip'
import { ConditionBadge, MovementBadge } from '../../../components/ui/badges'
import { Icon }          from '../../../components/icons/Icon'
import { Button }        from '@/components/ui/button'
import {
  ITEM_BY_ID, COMPANY_BY_ID, MOVEMENTS,
  fmtDate, CONDITION_LABEL,
} from '../../../lib/data'

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="t-label" style={{ fontSize: 11, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14 }}>{children}</div>
    </div>
  )
}

function InventoryDetail({ id }: { id: string }) {
  const router = useRouter()
  const item = ITEM_BY_ID[id]

  if (!item) {
    return <EmptyState icon="package" title="Item not found" message="This item doesn't exist in inventory." />
  }

  const company   = COMPANY_BY_ID[item.companyId]
  const movements = MOVEMENTS.filter(m => m.itemId === id)
    .sort((a, b) => new Date(b.movedAt).getTime() - new Date(a.movedAt).getTime())

  const isLow = item.quantity < item.threshold

  return (
    <div>
      <PageHeader
        title={item.name}
        breadcrumb={
          <>
            <span onClick={() => router.push('/inventory')} style={{ cursor: 'pointer' }}>Inventory</span>
            <Icon name="chevronRight" size={12} />
            <span className="t-mono">{item.serial ?? item.name}</span>
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
              <div>{company?.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>{company?.code}</div>
            </KV>
            <KV label="Category">{item.category.label}</KV>
            <KV label="Condition"><ConditionBadge value={item.condition} /></KV>
            <KV label="Brand">{item.brand}</KV>
            <KV label="Model">{item.model}</KV>
            <KV label="Serial Number">
              {item.isSerialised
                ? <span className="t-mono" style={{ fontSize: 13 }}>{item.serial}</span>
                : <span className="muted">Not serialised</span>
              }
            </KV>
            <KV label="Supplier">{item.supplier || '—'}</KV>
            <KV label="Purchase Date">{fmtDate(item.purchaseDate)}</KV>
            <KV label="Last Updated">{fmtDate(item.updated)}</KV>
          </div>

          {(item.description || item.notes) && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {item.description && <KV label="Description">{item.description}</KV>}
                {item.notes      && <KV label="Internal Notes">{item.notes}</KV>}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="col gap-4">

          {/* Quantity card */}
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <div className="t-label" style={{ marginBottom: 8 }}>Current quantity</div>
            <div style={{
              fontSize: 56, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em',
              color: isLow ? 'var(--error)' : 'var(--text)',
            }}>
              {item.quantity}
            </div>
            <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>
              Threshold: {item.threshold}
            </div>
            {isLow && (
              <div className="row gap-2" style={{
                justifyContent: 'center', marginTop: 12,
                padding: '6px 10px', background: '#fef2f2',
                borderRadius: 6, color: 'var(--error)',
                fontSize: 12, fontWeight: 500,
              }}>
                <Icon name="alert" size={14} stroke="var(--error)" />
                Below threshold
              </div>
            )}
          </div>

          {/* Quick actions card */}
          <div className="card" style={{ padding: 16 }}>
            <div className="t-label" style={{ marginBottom: 12 }}>Quick actions</div>
            <div className="col gap-2">
              <Button
                variant="outline"
                style={{ justifyContent: 'flex-start', gap: 8 }}
                onClick={() => router.push(`/movements/stock-in?item=${id}`)}
              >
                <Icon name="arrowDown" size={15} /> Stock In / Restock
              </Button>
              <Button
                variant="outline"
                style={{ justifyContent: 'flex-start', gap: 8 }}
                onClick={() => router.push(`/movements/stock-out?item=${id}`)}
              >
                <Icon name="arrowUp" size={15} /> Stock Out
              </Button>
              <Button
                variant="outline"
                style={{ justifyContent: 'flex-start', gap: 8 }}
              >
                <Icon name="print" size={15} /> Print Label
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Movement history ──────────────────────────────────────────── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="row" style={{ justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="t-h3">Movement History</div>
          <div className="muted" style={{ fontSize: 13 }}>{movements.length} record{movements.length !== 1 ? 's' : ''}</div>
        </div>

        {movements.length === 0 ? (
          <EmptyState
            icon="history"
            title="No movements yet"
            message="Stock-in or stock-out activity will appear here."
          />
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
                    {m.condBefore
                      ? <>{CONDITION_LABEL[m.condBefore]} <span className="muted">→</span> {CONDITION_LABEL[m.condAfter]}</>
                      : CONDITION_LABEL[m.condAfter]
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
    <AppShell
      user={user}
      onLogout={() => { localStorage.removeItem('auth_user'); router.push('/login') }}
    >
      <InventoryDetail id={id} />
    </AppShell>
  )
}
