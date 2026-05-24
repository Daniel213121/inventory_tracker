'use client'

import { Icon }       from '../icons/Icon'
import { ITEM_BY_ID, WAYBILL_BY_ID, fmtDate } from '../../lib/data'
import type { Movement } from '../../lib/types'

/* ─── Utility: items still out grouped by waybill ───────────────────────── */
import { MOVEMENTS } from '../../lib/data'

export function getDispatchedByWaybill(companyId: string): [string, Movement[]][] {
  const sorted = [...MOVEMENTS]
    .filter(m => m.companyId === companyId)
    .sort((a, b) => new Date(a.movedAt).getTime() - new Date(b.movedAt).getTime())

  const byItem = new Map<string, Movement>()
  sorted.forEach(m => {
    if (m.type === 'OUT' && m.waybillId) byItem.set(m.itemId, m)
    else byItem.delete(m.itemId)
  })

  const byWaybill = new Map<string, Movement[]>()
  for (const m of byItem.values()) {
    const key = m.waybillId!
    if (!byWaybill.has(key)) byWaybill.set(key, [])
    byWaybill.get(key)!.push(m)
  }

  return [...byWaybill.entries()]
    .sort(([, a], [, b]) =>
      new Date(b[0].movedAt).getTime() - new Date(a[0].movedAt).getTime()
    )
}

/* ─── Component ─────────────────────────────────────────────────────────── */

interface Props {
  waybillGroups:    [string, Movement[]][]
  selectedId:       string | null
  expandedWaybills: Set<string>
  onSelectRow:      (id: string) => void
  onToggleWaybill:  (waybillId: string) => void
}

export function StockInWaybillList({
  waybillGroups,
  selectedId,
  expandedWaybills,
  onSelectRow,
  onToggleWaybill,
}: Props) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="t-h3">Items currently out</div>
        <div className="muted" style={{ fontSize: 13 }}>
          {waybillGroups.length === 0
            ? 'All items are in stock.'
            : 'Click an item to record its return'}
        </div>
      </div>

      {waybillGroups.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center' }}>
          <div className="muted" style={{ fontSize: 14 }}>All items are currently in stock.</div>
        </div>
      ) : (
        waybillGroups.map(([waybillId, movements]) => {
          const waybill = WAYBILL_BY_ID[waybillId]
          return (
            <div key={waybillId}>
              {/* Group header */}
              <div
                onClick={() => onToggleWaybill(waybillId)}
                style={{
                  padding: '10px 20px',
                  background: 'var(--bg)',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', userSelect: 'none',
                }}
              >
                <Icon
                  name={expandedWaybills.has(waybillId) ? 'chevronDown' : 'chevronRight'}
                  size={14}
                  stroke="var(--text-2)"
                />
                <span className="t-mono" style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: 13 }}>
                  {waybill?.number ?? waybillId}
                </span>
                <span style={{ fontSize: 13 }}>{waybill?.suppliedTo}</span>
                <span className="muted" style={{ fontSize: 12 }}>·</span>
                <span className="muted" style={{ fontSize: 12 }}>{waybill ? fmtDate(waybill.date) : ''}</span>
                <span className="muted" style={{ fontSize: 12 }}>·</span>
                <span className="muted" style={{ fontSize: 12 }}>
                  {movements.length} item{movements.length !== 1 ? 's' : ''} out
                </span>
              </div>

              {/* Items table — only when expanded */}
              {expandedWaybills.has(waybillId) && (
                <table className="tbl">
                  <tbody>
                    {movements.map(m => {
                      const item   = ITEM_BY_ID[m.itemId]
                      const active = selectedId === m.id
                      return (
                        <tr
                          key={m.id}
                          onClick={() => onSelectRow(m.id)}
                          style={{ cursor: 'pointer', background: active ? '#eff6ff' : undefined }}
                        >
                          <td style={{ width: 32, paddingLeft: 32 }}>
                            <div style={{
                              width: 16, height: 16, borderRadius: '50%',
                              border: `2px solid ${active ? 'var(--secondary)' : 'var(--border)'}`,
                              background: active ? 'var(--secondary)' : '#fff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                            </div>
                          </td>
                          <td style={{ fontWeight: 500, fontSize: 13 }}>
                            {item?.name}
                            <div className="muted" style={{ fontSize: 11, marginTop: 1 }}>
                              {item?.isSerialised
                                ? `${(m.serialsDispatched ?? []).length} serial${(m.serialsDispatched ?? []).length !== 1 ? 's' : ''} dispatched`
                                : 'Qty tracked'}
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{m.quantity}</td>
                          <td style={{ fontSize: 12 }}>
                            {item?.isSerialised ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {(m.serialsDispatched ?? []).map(s => (
                                  <span key={s} className="t-mono" style={{
                                    fontSize: 11, padding: '2px 6px', borderRadius: 4,
                                    background: '#f3f4f6', border: '1px solid var(--border)',
                                  }}>
                                    {s}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="muted">{m.quantity} units</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
