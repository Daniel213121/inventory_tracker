import { SectionTitle } from '../ui/SectionTitle'
import { CompanyChip }  from '../ui/CompanyChip'
import { fmtDate }      from '../../lib/utils'
import type { ReportDispatched } from '@/app/actions/reports'

function daysOut(movedAt: string) {
  return Math.floor((Date.now() - new Date(movedAt).getTime()) / 86_400_000)
}

interface ItemsOutSectionProps {
  dispatched: ReportDispatched[]
}

export function ItemsOutSection({ dispatched }: ItemsOutSectionProps) {
  return (
    <div className="card" style={{ padding: 24, marginBottom: 24 }}>
      <SectionTitle action={
        <span className="badge badge-out">{dispatched.length} outstanding</span>
      }>
        3. Items Currently Out
      </SectionTitle>

      {dispatched.length === 0 ? (
        <div className="muted" style={{ textAlign: 'center', padding: '24px 0', fontSize: 13 }}>
          No items currently dispatched.
        </div>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>Item</th>
              <th>Serials</th>
              <th style={{ textAlign: 'right' }}>Qty Out</th>
              <th>Supplied To</th>
              <th>Date Out</th>
              <th style={{ textAlign: 'right' }}>Days Out</th>
              <th>Company</th>
            </tr>
          </thead>
          <tbody>
            {dispatched.map(m => {
              const d = daysOut(m.movedAt)
              return (
                <tr key={m.id}>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{m.itemName}</td>
                  <td className="t-mono muted" style={{ fontSize: 11 }}>
                    {m.serialsDispatched.length > 0
                      ? m.serialsDispatched.slice(0, 2).join(', ') + (m.serialsDispatched.length > 2 ? ` +${m.serialsDispatched.length - 2}` : '')
                      : '—'
                    }
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{m.quantity}</td>
                  <td style={{ fontSize: 13 }}>{m.suppliedTo}</td>
                  <td className="muted" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{fmtDate(m.movedAt)}</td>
                  <td style={{
                    textAlign: 'right', fontWeight: 600,
                    color: d > 30 ? 'var(--error)' : undefined,
                  }}>
                    {d}d
                  </td>
                  <td><CompanyChip code={m.companyCode} name={m.companyName} logoUrl={m.companyLogoUrl} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
