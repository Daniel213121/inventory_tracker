'use client'

import { Icon } from '../icons/Icon'
import type { ConditionValue } from '@/lib/types'

export interface ScannedItem {
  name:         string
  brand:        string
  model:        string
  quantity:     number
  condition:    'NEW' | 'USED' | 'FAULTY'
  category:     string
  supplier:     string
  purchaseDate: string
  description:  string
  serials:      string[]
  threshold:    number
}

interface Category { id: string; value: string; label: string }

interface Props {
  items:      ScannedItem[]
  categories: Category[]
  onChange:   (items: ScannedItem[]) => void
}

const CONDITIONS: ConditionValue[] = ['NEW', 'USED', 'FAULTY']

export function ScanPreview({ items, categories, onChange }: Props) {
  const update = (idx: number, field: keyof ScannedItem, value: unknown) => {
    onChange(items.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const remove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx))
  }

  const knownValues = new Set(categories.map(c => c.value.toUpperCase()))

  if (items.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-2)' }}>
        No items to show. Try a different image.
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border)' }}>
      <table className="tbl" style={{ minWidth: 900 }}>
        <thead>
          <tr>
            <th style={{ minWidth: 180 }}>Name</th>
            <th style={{ minWidth: 160 }}>Brand / Model</th>
            <th style={{ width: 90 }}>Qty</th>
            <th style={{ minWidth: 120 }}>Condition</th>
            <th style={{ minWidth: 180 }}>Category</th>
            <th style={{ minWidth: 140 }}>Supplier</th>
            <th style={{ width: 40 }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const isSerialized  = item.serials.length > 0
            const isNewCategory = item.category !== '' && !knownValues.has(item.category.toUpperCase())

            return (
              <tr key={idx}>
                <td>
                  <input
                    className="input"
                    style={{ fontSize: 13 }}
                    value={item.name}
                    onChange={e => update(idx, 'name', e.target.value)}
                    placeholder="Item name"
                  />
                </td>
                <td>
                  <input
                    className="input"
                    style={{ fontSize: 13, marginBottom: 4 }}
                    value={item.brand}
                    onChange={e => update(idx, 'brand', e.target.value)}
                    placeholder="Brand"
                  />
                  <input
                    className="input"
                    style={{ fontSize: 12 }}
                    value={item.model}
                    onChange={e => update(idx, 'model', e.target.value)}
                    placeholder="Model / Part no."
                  />
                </td>
                <td>
                  {isSerialized ? (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                        {item.serials.length} serial{item.serials.length !== 1 ? 's' : ''}
                      </div>
                      <div style={{ maxHeight: 72, overflowY: 'auto' }}>
                        {item.serials.map((s, si) => (
                          <div key={si} className="t-mono" style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.6 }}>
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <input
                      type="number"
                      min={1}
                      className="input"
                      style={{ fontSize: 13 }}
                      value={item.quantity}
                      onChange={e => update(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  )}
                </td>
                <td>
                  <select
                    className="select"
                    style={{ fontSize: 13 }}
                    value={item.condition}
                    onChange={e => update(idx, 'condition', e.target.value as ConditionValue)}
                  >
                    {CONDITIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    className="select"
                    style={{
                      fontSize: 13,
                      borderColor: isNewCategory ? 'var(--warning)' : undefined,
                    }}
                    value={item.category}
                    onChange={e => update(idx, 'category', e.target.value)}
                  >
                    <option value="">— select category —</option>
                    {/* AI suggested a category that doesn't exist yet — show as "create" option */}
                    {isNewCategory && (
                      <option value={item.category}>+ Create "{item.category}"</option>
                    )}
                    {categories.map(c => (
                      <option key={c.id} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  {isNewCategory && (
                    <div style={{ fontSize: 11, color: 'var(--warning)', marginTop: 3 }}>
                      New category — will be created on save
                    </div>
                  )}
                </td>
                <td>
                  <input
                    className="input"
                    style={{ fontSize: 13 }}
                    value={item.supplier}
                    onChange={e => update(idx, 'supplier', e.target.value)}
                    placeholder="Supplier"
                  />
                </td>
                <td>
                  <button
                    onClick={() => remove(idx)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--error)', padding: '0 6px' }}
                    title="Remove row"
                  >
                    <Icon name="trash" size={14} stroke="var(--error)" />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
