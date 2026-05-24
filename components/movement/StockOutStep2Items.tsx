'use client'

import { useEffect, useState }  from 'react'
import { SearchBar }            from '../ui/SearchBar'
import { Icon }                 from '../icons/Icon'
import { listInventory }        from '@/app/actions/inventory'
import type { InventoryItem }   from '../../lib/types'
import type { Line }            from './stockout-types'
import type { ConditionValue }  from '../../lib/types'

const COND_LABEL: Record<ConditionValue, string> = { NEW: 'New', USED: 'Used', FAULTY: 'Faulty' }
const CONDITIONS: ConditionValue[] = ['NEW', 'USED', 'FAULTY']

interface Props {
  lines:   Line[]
  onLines: (l: Line[]) => void
}

export function StockOutStep2Items({ lines, onLines }: Props) {
  const [q,         setQ]         = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [items,     setItems]     = useState<InventoryItem[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    listInventory({ pageSize: 200 }).then(res => {
      setItems(res.items as InventoryItem[])
      setLoading(false)
    })
  }, [])

  const itemMap = Object.fromEntries(items.map(i => [i.id, i]))

  const filtered = q
    ? items.filter(i =>
        `${i.name} ${i.brand} ${i.model} ${i.serialUnits.map(u => u.serial).join(' ')}`
          .toLowerCase().includes(q.toLowerCase())
      )
    : items

  /* ── helpers ─────────────────────────────────────────────────── */

  const lineFor = (itemId: string) => lines.find(l => l.itemId === itemId)

  const addItem = (itemId: string) => {
    if (lineFor(itemId)) return
    const item = itemMap[itemId]
    // For non-serialised, default conditionFrom to whichever bucket has stock
    const defaultCond: ConditionValue =
      !item.isSerialised
        ? (item.qtyNew > 0 ? 'NEW' : item.qtyUsed > 0 ? 'USED' : 'FAULTY')
        : 'NEW'
    onLines([...lines, {
      itemId,
      itemName:       item?.name        ?? '',
      isSerialised:   item?.isSerialised ?? false,
      qty:            item?.isSerialised ? 0 : 1,
      selectedSerials: [],
      conditionFrom:  item?.isSerialised ? undefined : defaultCond,
    }])
    setCollapsed(prev => { const s = new Set(prev); s.delete(itemId); return s })
  }

  const removeItem = (itemId: string) => {
    onLines(lines.filter(l => l.itemId !== itemId))
    setCollapsed(prev => { const s = new Set(prev); s.delete(itemId); return s })
  }

  const toggleSerial = (itemId: string, serial: string) => {
    onLines(lines.map(l => {
      if (l.itemId !== itemId) return l
      const already = l.selectedSerials.includes(serial)
      const next    = already
        ? l.selectedSerials.filter(s => s !== serial)
        : [...l.selectedSerials, serial]
      return { ...l, selectedSerials: next, qty: next.length }
    }))
  }

  const toggleAll = (itemId: string, allSerials: string[]) => {
    onLines(lines.map(l => {
      if (l.itemId !== itemId) return l
      const allSelected = allSerials.every(s => l.selectedSerials.includes(s))
      const next        = allSelected ? [] : [...allSerials]
      return { ...l, selectedSerials: next, qty: next.length }
    }))
  }

  const setLineQty = (itemId: string, qty: number) =>
    onLines(lines.map(l => l.itemId !== itemId ? l : { ...l, qty }))

  const setConditionFrom = (itemId: string, cond: ConditionValue) =>
    onLines(lines.map(l => l.itemId !== itemId ? l : { ...l, conditionFrom: cond, qty: Math.min(l.qty, bucketQty(itemMap[itemId], cond)) }))

  const bucketQty = (item: InventoryItem, cond: ConditionValue) =>
    cond === 'NEW' ? item.qtyNew : cond === 'USED' ? item.qtyUsed : item.qtyFaulty

  const toggleCollapse = (itemId: string) =>
    setCollapsed(prev => {
      const s = new Set(prev)
      s.has(itemId) ? s.delete(itemId) : s.add(itemId)
      return s
    })

  const totalUnits = lines.reduce((s, l) => s + l.qty, 0)

  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="t-h3" style={{ marginBottom: 16 }}>Select items to dispatch</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 24 }}>

        {/* ── Left: item list ──────────────────────────────────── */}
        <div>
          <SearchBar value={q} onChange={setQ} placeholder="Search items…" />
          <div style={{ marginTop: 12, border: '1px solid var(--border)', borderRadius: 8, height: 'calc(100vh - 420px)', minHeight: 240, overflowY: 'auto' }}>
            {loading && (
              <div className="muted" style={{ padding: 24, textAlign: 'center', fontSize: 13 }}>
                Loading inventory…
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="muted" style={{ padding: 24, textAlign: 'center', fontSize: 13 }}>No items found</div>
            )}
            {!loading && filtered.map((item, i) => {
              const line     = lineFor(item.id)
              const inList   = !!line
              const selected = item.isSerialised ? (line?.selectedSerials.length ?? 0) : (line?.qty ?? 0)
              return (
                <div key={item.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div className="row" style={{ padding: '12px 14px', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row gap-2" style={{ flexWrap: 'wrap' }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                        {!item.isSerialised && (
                          <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 999, background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }}>
                            qty only
                          </span>
                        )}
                        {inList && selected > 0 && (
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 999, background: '#dcfce7', color: '#15803d' }}>
                            {selected} selected
                          </span>
                        )}
                      </div>
                      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                        {item.brand} · {item.model} · {item.quantity} in stock
                        {!item.isSerialised && item.quantity > 0 && (
                          <span>
                            {' '}({[
                              item.qtyNew    > 0 && `${item.qtyNew} New`,
                              item.qtyUsed   > 0 && `${item.qtyUsed} Used`,
                              item.qtyFaulty > 0 && `${item.qtyFaulty} Faulty`,
                            ].filter(Boolean).join(' · ')})
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`btn btn-sm ${inList ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => inList ? removeItem(item.id) : addItem(item.id)}
                      style={{ flexShrink: 0, marginLeft: 8 }}
                    >
                      {inList ? 'Remove' : 'Select'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Right: serial picker / qty + condition stepper ───── */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, flexShrink: 0 }}>
            Pick serials or quantity to dispatch
          </div>

          {lines.length === 0 ? (
            <div style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: 32, textAlign: 'center' }}>
              <Icon name="document" size={24} stroke="#9ca3af" />
              <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>No items selected</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Click Select on an item to add it</div>
            </div>
          ) : (
            <div className="col gap-3" style={{ flex: 1, height: 'calc(100vh - 420px)', minHeight: 240, overflowY: 'auto', paddingRight: 6 }}>
              {lines.map(line => {
                const item = itemMap[line.itemId]
                if (!item) return null
                const isCollapsed = collapsed.has(line.itemId)

                /* ── Non-serialised: condition picker + qty stepper ── */
                if (!item.isSerialised) {
                  const cond     = line.conditionFrom ?? 'NEW'
                  const maxQty   = bucketQty(item, cond)
                  const done     = line.qty > 0
                  return (
                    <div key={line.itemId} style={{ border: `1px solid ${done ? '#86efac' : 'var(--border)'}`, borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ padding: '12px 14px', background: done ? '#f0fdf4' : 'var(--bg)' }}>
                        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                              Available: {[
                                item.qtyNew    > 0 && `${item.qtyNew} New`,
                                item.qtyUsed   > 0 && `${item.qtyUsed} Used`,
                                item.qtyFaulty > 0 && `${item.qtyFaulty} Faulty`,
                              ].filter(Boolean).join(' · ') || 'None'}
                            </div>
                          </div>
                          <button type="button" onClick={() => removeItem(item.id)}
                            style={{ background: 'none', border: 0, cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                            <Icon name="x" size={14} />
                          </button>
                        </div>

                        {/* Condition selector */}
                        <div className="row gap-2" style={{ marginBottom: 10 }}>
                          {CONDITIONS.map(c => {
                            const qty    = bucketQty(item, c)
                            const active = cond === c
                            return (
                              <button
                                key={c}
                                type="button"
                                disabled={qty === 0}
                                onClick={() => setConditionFrom(item.id, c)}
                                style={{
                                  padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                                  border: `1px solid ${active ? 'var(--secondary)' : 'var(--border)'}`,
                                  background: active ? 'var(--secondary)' : '#fff',
                                  color: active ? '#fff' : qty === 0 ? '#d1d5db' : 'var(--text)',
                                  cursor: qty === 0 ? 'not-allowed' : 'pointer',
                                }}
                              >
                                {COND_LABEL[c]} <span style={{ opacity: 0.75 }}>({qty})</span>
                              </button>
                            )
                          })}
                        </div>

                        {/* Qty stepper */}
                        <div className="row gap-2" style={{ alignItems: 'center' }}>
                          <button type="button"
                            onClick={() => setLineQty(item.id, Math.max(0, line.qty - 1))}
                            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            −
                          </button>
                          <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: 15 }}>{line.qty}</span>
                          <button type="button"
                            onClick={() => setLineQty(item.id, Math.min(maxQty, line.qty + 1))}
                            disabled={line.qty >= maxQty}
                            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: '#fff', cursor: line.qty >= maxQty ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            +
                          </button>
                          <span className="muted" style={{ fontSize: 12 }}>of {maxQty} {COND_LABEL[cond]}</span>
                        </div>
                      </div>
                    </div>
                  )
                }

                /* ── Serialised: serial checkboxes ── */
                const inStockSerials = item.serialUnits.filter(u => u.status === 'IN_STOCK')
                const allSelected    = inStockSerials.length > 0 && inStockSerials.every(u => line.selectedSerials.includes(u.serial))
                const done           = line.selectedSerials.length > 0

                return (
                  <div key={line.itemId} style={{ border: `1px solid ${done ? '#86efac' : 'var(--border)'}`, borderRadius: 8, overflow: 'hidden', transition: 'border-color 0.15s' }}>

                    {/* Header */}
                    <div
                      className="row"
                      style={{ padding: '10px 14px', justifyContent: 'space-between', background: done ? '#f0fdf4' : 'var(--bg)', borderBottom: isCollapsed ? 'none' : '1px solid var(--border)', cursor: 'pointer' }}
                      onClick={() => toggleCollapse(line.itemId)}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                        <div style={{ fontSize: 12, marginTop: 2, color: done ? '#16a34a' : 'var(--text-2)' }}>
                          {line.selectedSerials.length === 0
                            ? 'No serials selected yet'
                            : isCollapsed
                              ? line.selectedSerials.join(' · ')
                              : `${line.selectedSerials.length} of ${inStockSerials.length} selected`
                          }
                        </div>
                      </div>
                      <div className="row gap-2" onClick={e => e.stopPropagation()}>
                        {!isCollapsed && (
                          <button type="button" className="btn btn-ghost btn-sm"
                            style={{ fontSize: 12, color: 'var(--secondary)' }}
                            onClick={() => toggleAll(item.id, inStockSerials.map(u => u.serial))}>
                            {allSelected ? 'None' : 'All'}
                          </button>
                        )}
                        <button type="button" onClick={() => removeItem(item.id)}
                          style={{ background: 'none', border: 0, cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                          <Icon name="x" size={14} />
                        </button>
                        <Icon name={isCollapsed ? 'chevronRight' : 'chevronDown'} size={15} stroke="var(--text-2)" style={{ cursor: 'pointer' }} />
                      </div>
                    </div>

                    {/* Serial checkboxes */}
                    {!isCollapsed && (
                      <div style={{ padding: '4px 0', background: '#fff' }}>
                        {inStockSerials.map((unit, si) => {
                          const checked = line.selectedSerials.includes(unit.serial)
                          return (
                            <label key={unit.serial} className="row gap-3" style={{
                              padding: '9px 14px', cursor: 'pointer',
                              borderBottom: si < inStockSerials.length - 1 ? '1px solid var(--border)' : 'none',
                              background: checked ? '#eff6ff' : '#fff',
                              transition: 'background 0.1s',
                            }}>
                              <input type="checkbox" checked={checked}
                                onChange={() => toggleSerial(item.id, unit.serial)}
                                style={{ accentColor: 'var(--secondary)', width: 16, height: 16, flexShrink: 0 }}
                              />
                              <span className="t-mono" style={{ fontSize: 13, fontWeight: checked ? 600 : 400, color: checked ? 'var(--secondary)' : 'var(--text)', flex: 1 }}>
                                {unit.serial}
                              </span>
                              <span style={{
                                fontSize: 11, padding: '2px 7px', borderRadius: 4, fontWeight: 500,
                                background: unit.condition === 'NEW' ? '#dcfce7' : unit.condition === 'USED' ? '#fef9c3' : '#fee2e2',
                                color:      unit.condition === 'NEW' ? '#15803d' : unit.condition === 'USED' ? '#854d0e' : '#991b1b',
                              }}>
                                {unit.condition}
                              </span>
                              {checked && <Icon name="check" size={13} stroke="#2563EB" />}
                            </label>
                          )
                        })}
                        {line.selectedSerials.length > 0 && (
                          <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
                            <button type="button" className="btn btn-ghost btn-sm"
                              style={{ fontSize: 12, color: 'var(--secondary)' }}
                              onClick={() => toggleCollapse(line.itemId)}>
                              Done — collapse ↑
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {totalUnits > 0 && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, fontSize: 13, flexShrink: 0 }}>
              <Icon name="check" size={13} stroke="#16a34a" style={{ marginRight: 6, verticalAlign: 'middle' }} />
              <strong>{totalUnits}</strong> unit{totalUnits !== 1 ? 's' : ''} across <strong>{lines.length}</strong> item{lines.length !== 1 ? 's' : ''} ready to dispatch
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
