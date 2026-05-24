'use client'

import { useRouter } from 'next/navigation'
import { MovementBadge } from '../ui/badges'
import { CompanyChip }   from '../ui/CompanyChip'
import { INVENTORY, MOVEMENTS, ITEM_BY_ID, fmtDateShort } from '../../lib/data'
import type { Movement } from '../../lib/types'

const recent = [...MOVEMENTS]
  .sort((a, b) => new Date(b.movedAt).getTime() - new Date(a.movedAt).getTime())
  .slice(0, 10)

interface Props {
  compact?: boolean
}

export function RecentMovementsCard({ compact }: Props) {
  const router = useRouter()

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div className="row" style={{ justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div>
          <div className="t-h3">Recent Movements</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>Last {recent.length} entries</div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--secondary)' }}
          onClick={() => router.push('/movements')}
        >
          View all →
        </button>
      </div>

      {/* Table */}
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
            {recent.map(m => {
              const item = ITEM_BY_ID[m.itemId]
              return (
                <tr
                  key={m.id}
                  onClick={() => router.push(`/inventory/${m.itemId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>{fmtDateShort(m.movedAt)}</td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{item?.name ?? m.itemId}</div>
                    <div className="t-mono muted" style={{ fontSize: 11 }}>{item?.serial}</div>
                  </td>
                  <td><MovementBadge type={m.type} /></td>
                  {!compact && <td><CompanyChip companyId={m.companyId} /></td>}
                  <td style={{ fontWeight: 600 }}>{m.quantity}</td>
                  {!compact && <td className="muted" style={{ fontSize: 13 }}>{m.movedBy}</td>}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
