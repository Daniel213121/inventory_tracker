'use client'

import { useRouter } from 'next/navigation'
import { ConditionBadge } from '../ui/badges'
import { CompanyChip }    from '../ui/CompanyChip'
import { EmptyState }     from '../ui/EmptyState'
import { Icon }           from '../icons/Icon'
import { Button }         from '@/components/ui/button'
import { fmtDate } from '../../lib/data'
import type { InventoryItem } from '../../lib/types'

interface Props {
  items: InventoryItem[]
}

export function InventoryTable({ items }: Props) {
  const router = useRouter()

  if (items.length === 0) {
    return (
      <EmptyState
        icon="package"
        title="No items found"
        message="Try adjusting your filters or search query."
      />
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="tbl">
        <thead>
          <tr>
            <th>Serial No.</th>
            <th>Name</th>
            <th>Category</th>
            <th>Brand / Model</th>
            <th>Condition</th>
            <th style={{ textAlign: 'right' }}>Qty</th>
            <th>Company</th>
            <th>Last Updated</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr
              key={item.id}
              onClick={() => router.push(`/inventory/${item.id}`)}
              style={{ cursor: 'pointer' }}
            >
              {/* Serial */}
              <td className="t-mono" style={{ fontSize: 13 }}>{item.serial ?? <span className="muted">—</span>}</td>

              {/* Name + supplier */}
              <td>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>{item.supplier}</div>
              </td>

              {/* Category */}
              <td>
                <span style={{
                  display: 'inline-block',
                  padding: '3px 9px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 500,
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}>
                  {item.category.label}
                </span>
              </td>

              {/* Brand / Model */}
              <td>
                <div style={{ fontSize: 13 }}>{item.brand}</div>
                <div className="muted" style={{ fontSize: 12 }}>{item.model}</div>
              </td>

              {/* Condition */}
              <td><ConditionBadge value={item.condition} /></td>

              {/* Qty */}
              <td style={{ textAlign: 'right' }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{item.quantity}</span>
                {item.quantity < item.threshold && (
                  <Icon
                    name="alert"
                    size={14}
                    stroke="#DC2626"
                    style={{ marginLeft: 6, verticalAlign: 'middle' }}
                  />
                )}
              </td>

              {/* Company */}
              <td><CompanyChip companyId={item.companyId} /></td>

              {/* Updated */}
              <td className="muted" style={{ fontSize: 13 }}>{fmtDate(item.updated)}</td>

              {/* Actions */}
              <td onClick={e => e.stopPropagation()}>
                <div className="row gap-2">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => router.push(`/inventory/${item.id}`)}
                    title="View"
                  >
                    <Icon name="eye" size={15} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => router.push(`/inventory/${item.id}/edit`)}
                    title="Edit"
                  >
                    <Icon name="edit" size={15} />
                  </button>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/movements/stock-out?item=${item.id}`)}
                    style={{ background: 'var(--secondary)', color: '#fff' }}
                  >
                    Stock Out
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
