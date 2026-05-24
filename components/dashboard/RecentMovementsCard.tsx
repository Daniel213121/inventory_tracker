'use client'

import { useRouter }     from 'next/navigation'
import { MovementBadge } from '../ui/badges'
import { CompanyChip }   from '../ui/CompanyChip'
import { fmtDateShort }  from '../../lib/data'
import type { DashboardMovement } from '@/app/actions/dashboard'

interface Props {
  compact?:  boolean
  movements: DashboardMovement[]
}

export function RecentMovementsCard({ compact, movements }: Props) {
  const router = useRouter()

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="row" style={{ justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div>
          <div className="t-h3">Recent Movements</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>Last {movements.length} entries</div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--secondary)' }}
          onClick={() => router.push('/movements')}
        >
          View all →
        </button>
      </div>

      <div style={{ maxHeight: compact ? 380 : 540, overflowY: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Date</th>
              <th>Item</th>
              <th>Type</th>
              {!compact && <th>Company</th>}
              <th>Qty</th>
              {!compact && <th>Moved By</th>}
            </tr>
          </thead>
          <tbody>
            {movements.map(m => (
              <tr
                key={m.id}
                onClick={() => router.push(`/inventory/${m.itemId}`)}
                style={{ cursor: 'pointer' }}
              >
                <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>{fmtDateShort(m.movedAt)}</td>
                <td style={{ fontWeight: 500, fontSize: 13 }}>{m.itemName}</td>
                <td><MovementBadge type={m.type} /></td>
                {!compact && <td><CompanyChip code={m.companyCode} name={m.companyName} /></td>}
                <td style={{ fontWeight: 600 }}>{m.quantity}</td>
                {!compact && <td className="muted" style={{ fontSize: 13 }}>{m.movedBy}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
