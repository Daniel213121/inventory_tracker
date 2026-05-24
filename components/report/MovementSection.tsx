import { SectionTitle }  from '../ui/SectionTitle'
import { Legend }        from '../ui/Legend'
import { LineChart }     from '../ui/LineChart'
import { CompanyChip }   from '../ui/CompanyChip'
import { MovementBadge } from '../ui/badges'
import { fmtDate }       from '../../lib/data'
import type { ReportMovement } from '@/app/actions/reports'

interface MovementSectionProps {
  dayLabels: string[]
  inSeries:  number[]
  outSeries: number[]
  movements: ReportMovement[]
}

export function MovementSection({ dayLabels, inSeries, outSeries, movements }: MovementSectionProps) {
  return (
    <div className="card" style={{ padding: 24, marginBottom: 24 }}>
      <SectionTitle action={
        <Legend items={[{ label: 'In', color: '#16A34A' }, { label: 'Out', color: '#2563EB' }]} />
      }>
        2. Movement History
      </SectionTitle>

      <LineChart
        labels={dayLabels}
        series={[
          { name: 'In',  color: '#16A34A', values: inSeries  },
          { name: 'Out', color: '#2563EB', values: outSeries },
        ]}
        height={220}
      />

      {movements.length === 0 ? (
        <div className="muted" style={{ textAlign: 'center', padding: '24px 0', fontSize: 13 }}>
          No movements in this period.
        </div>
      ) : (
        <table className="tbl" style={{ marginTop: 24 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Item</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Supplied To / Source</th>
              <th>Company</th>
              <th>Moved By</th>
            </tr>
          </thead>
          <tbody>
            {movements.slice(0, 8).map(m => (
              <tr key={m.id}>
                <td className="muted" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{fmtDate(m.movedAt)}</td>
                <td style={{ fontSize: 13, fontWeight: 500 }}>{m.itemName}</td>
                <td><MovementBadge type={m.type} /></td>
                <td style={{ fontWeight: 600 }}>{m.quantity}</td>
                <td style={{ fontSize: 13 }}>{m.suppliedTo || '—'}</td>
                <td><CompanyChip code={m.companyCode} name={m.companyName} /></td>
                <td className="muted" style={{ fontSize: 13 }}>{m.movedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
