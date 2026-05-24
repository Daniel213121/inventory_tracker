'use client'

import { Icon } from '../icons/Icon'
import { ConditionBadge } from '../ui/badges'
import type { ConditionValue } from '../../lib/types'

export interface ImportRow {
  _row:        number
  name:        string
  brand:       string
  model:       string
  serials:     string[]
  category:    string
  condition:   string
  quantity:    number
  threshold:   number
  supplier:    string
  purchaseDate:string
  description: string
  notes:       string
  errors:      string[]
}

interface Props {
  rows: ImportRow[]
}

const CONDITIONS = new Set(['NEW', 'USED', 'FAULTY'])

export function ImportPreview({ rows }: Props) {
  const validCount   = rows.filter(r => r.errors.length === 0).length
  const invalidCount = rows.length - validCount

  return (
    <div>
      {/* Summary bar */}
      <div className="row gap-4" style={{ marginBottom: 16 }}>
        <div className="row gap-2" style={{ fontSize: 13 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
          <strong>{validCount}</strong> ready to import
        </div>
        {invalidCount > 0 && (
          <div className="row gap-2" style={{ fontSize: 13 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC2626', display: 'inline-block' }} />
            <strong>{invalidCount}</strong> rows have errors
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', maxHeight: 420, overflowY: 'auto', borderRadius: 8, border: '1px solid var(--border)' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Brand / Model</th>
              <th>Serial</th>
              <th>Category</th>
              <th>Condition</th>
              <th>Qty</th>
              <th>Supplier</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const hasError = row.errors.length > 0
              return (
                <tr key={row._row} style={{ background: hasError ? '#fff5f5' : undefined }}>
                  <td className="muted" style={{ fontSize: 12 }}>{row._row}</td>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{row.name || <span className="muted">—</span>}</td>
                  <td>
                    <div style={{ fontSize: 13 }}>{row.brand}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{row.model}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {row.serials.length === 0
                      ? <span className="muted">—</span>
                      : <>
                          <span className="t-mono">{row.serials[0]}</span>
                          {row.serials.length > 1 && (
                            <span className="muted" style={{ marginLeft: 4 }}>+{row.serials.length - 1} more</span>
                          )}
                        </>
                    }
                  </td>
                  <td style={{ fontSize: 13 }}>{row.category}</td>
                  <td>
                    {CONDITIONS.has(row.condition?.toUpperCase())
                      ? <ConditionBadge value={row.condition.toUpperCase() as ConditionValue} />
                      : <span className="muted" style={{ fontSize: 12 }}>{row.condition || '—'}</span>
                    }
                  </td>
                  <td style={{ fontWeight: 600 }}>{row.quantity}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{row.supplier || '—'}</td>
                  <td>
                    {hasError ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {row.errors.map((err, i) => (
                          <div key={i} className="row gap-2" style={{ fontSize: 11, color: 'var(--error)', whiteSpace: 'nowrap' }}>
                            <Icon name="alert" size={11} stroke="var(--error)" />
                            {err}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="row gap-2" style={{ fontSize: 12, color: 'var(--success)' }}>
                        <Icon name="check" size={13} stroke="var(--success)" />
                        Ready
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
