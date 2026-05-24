'use client'

import { Icon } from '../icons/Icon'
import type { Movement } from '../../lib/types'

export interface WaybillGroup {
  waybillId:     string
  waybillNumber: string
  suppliedTo:    string
  date:          string
  movements:     Movement[]
}

interface Props {
  waybillGroups:    WaybillGroup[]
  selectedId:       string | null
  expandedWaybills: Set<string>
  onSelectRow:      (id: string) => void
  onToggleWaybill:  (waybillId: string) => void
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
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
        waybillGroups.map(group => {
          const { waybillId, waybillNumber, suppliedTo, date, movements } = group
          return (
            <div key={waybillId}>
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
                  {waybillNumber}
                </span>
                <span style={{ fontSize: 13 }}>{suppliedTo}</span>
                <span className="muted" style={{ fontSize: 12 }}>·</span>
                <span className="muted" style={{ fontSize: 12 }}>{fmtDate(date)}</span>
                <span className="muted" style={{ fontSize: 12 }}>·</span>
                <span className="muted" style={{ fontSize: 12 }}>
                  {movements.length} item{movements.length !== 1 ? 's' : ''} out
                </span>
              </div>

              {expandedWaybills.has(waybillId) && (
                <table className="tbl">
                  <tbody>
                    {movements.map(m => {
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
                            {m.itemName}
                            <div className="muted" style={{ fontSize: 11, marginTop: 1 }}>
                              {m.itemIsSerialised
                                ? `${(m.serialsDispatched ?? []).length} serial${(m.serialsDispatched ?? []).length !== 1 ? 's' : ''} dispatched`
                                : 'Qty tracked'}
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{m.quantity}</td>
                          <td style={{ fontSize: 12 }}>
                            {m.itemIsSerialised ? (
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
