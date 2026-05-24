import { SectionTitle } from '../ui/SectionTitle'
import { CompanyChip } from '../ui/CompanyChip'
import { MOVEMENTS, ITEM_BY_ID, fmtDate } from '../../lib/data'

const TODAY_MS = new Date('2026-05-22').getTime()

function daysOut(movedAt: string) {
  return Math.floor((TODAY_MS - new Date(movedAt).getTime()) / 86_400_000)
}

interface ItemsOutSectionProps {
  companyFilter: string
}

export function ItemsOutSection({ companyFilter }: ItemsOutSectionProps) {
  const itemsOut = MOVEMENTS.filter(
    m => m.type === 'OUT' && (!companyFilter || m.companyId === companyFilter)
  )

  return (
    <div className="card" style={{ padding: 24, marginBottom: 24 }}>
      <SectionTitle action={
        <span className="badge badge-out">{itemsOut.length} outstanding</span>
      }>
        3. Items Currently Out
      </SectionTitle>

      <table className="tbl">
        <thead>
          <tr>
            <th>Item</th>
            <th>Serial No.</th>
            <th style={{ textAlign: 'right' }}>Qty Out</th>
            <th>Supplied To</th>
            <th>Date Out</th>
            <th style={{ textAlign: 'right' }}>Days Out</th>
            <th>Company</th>
          </tr>
        </thead>
        <tbody>
          {itemsOut.map(m => {
            const item = ITEM_BY_ID[m.itemId]
            const d = daysOut(m.movedAt)
            return (
              <tr key={m.id}>
                <td style={{ fontWeight: 500, fontSize: 13 }}>{item?.name ?? m.itemId}</td>
                <td className="t-mono muted" style={{ fontSize: 12 }}>{item?.serial ?? '—'}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{m.quantity}</td>
                <td style={{ fontSize: 13 }}>{m.suppliedTo}</td>
                <td className="muted" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{fmtDate(m.movedAt)}</td>
                <td style={{
                  textAlign: 'right', fontWeight: 600,
                  color: d > 30 ? 'var(--error)' : undefined,
                }}>
                  {d}d
                </td>
                <td><CompanyChip companyId={m.companyId} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
