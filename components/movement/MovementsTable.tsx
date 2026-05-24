'use client'

import { useRouter } from 'next/navigation'
import { MovementBadge } from '../ui/badges'
import { CompanyChip }   from '../ui/CompanyChip'
import { EmptyState }    from '../ui/EmptyState'
import { fmtDate }       from '../../lib/utils'
import type { Movement } from '../../lib/types'

interface Props {
  movements: Movement[]
}

export function MovementsTable({ movements }: Props) {
  const router = useRouter()

  if (movements.length === 0) {
    return <EmptyState icon="arrows" title="No movements found" message="Try adjusting your filters." />
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="tbl">
        <thead>
          <tr>
            <th>Date</th>
            <th>Item</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Supplied To / Source</th>
            <th>Company</th>
            <th>Waybill</th>
            <th>By</th>
          </tr>
        </thead>
        <tbody>
          {movements.map(m => (
            <tr
              key={m.id}
              onClick={() => router.push(`/inventory/${m.itemId}`)}
              style={{ cursor: 'pointer' }}
            >
              <td className="muted" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                {fmtDate(m.movedAt)}
              </td>
              <td>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{m.itemName ?? '—'}</div>
              </td>
              <td><MovementBadge type={m.type} /></td>
              <td style={{ fontWeight: 600 }}>{m.quantity}</td>
              <td style={{ fontSize: 13 }}>{m.suppliedTo || '—'}</td>
              <td>
                {m.companyCode
                  ? <CompanyChip code={m.companyCode} name={m.companyCode} />
                  : <span className="muted">—</span>
                }
              </td>
              <td onClick={e => e.stopPropagation()}>
                {m.waybillNumber ? (
                  <span
                    className="t-mono"
                    style={{ fontSize: 13, fontWeight: 500, color: 'var(--secondary)', cursor: 'pointer' }}
                    onClick={() => router.push(`/waybills/${m.waybillId}`)}
                  >
                    {m.waybillNumber}
                  </span>
                ) : (
                  <span className="muted">—</span>
                )}
              </td>
              <td className="muted" style={{ fontSize: 13 }}>{m.movedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
