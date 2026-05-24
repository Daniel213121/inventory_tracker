import { ITEM_BY_ID, COMPANY_BY_ID, WAYBILLS } from '../../lib/data'
import type { Line, Details } from './stockout-types'

interface Props {
  companyId: string
  lines:     Line[]
  details:   Details
}

export function StockOutStep4Review({ companyId, lines, details }: Props) {
  const company = COMPANY_BY_ID[companyId]
  const year    = new Date(details.date || Date.now()).getFullYear()
  const seq     = details.destinationCode
    ? WAYBILLS.filter(w =>
        w.companyId === companyId &&
        w.destinationCode === details.destinationCode &&
        new Date(w.date).getFullYear() === year
      ).length + 1
    : 0
  const waybillNum = company && details.destinationCode
    ? `${company.code}/${details.destinationCode}/${year}/${String(seq).padStart(2, '0')}`
    : '—'
  const totalUnits = lines.reduce((s, l) => s + l.qty, 0)

  const summaryFields: [string, string | undefined][] = [
    ['Company',          company?.name],
    ['Supplied To',      details.suppliedTo],
    ['Destination Code', details.destinationCode],
    ['Driver',           details.driverName],
    ['Car / Plate',      details.carNumber || undefined],
    ['Date',             details.date],
  ]

  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="t-h3" style={{ marginBottom: 16 }}>Review &amp; confirm</div>

      {/* Waybill number */}
      <div style={{
        background: '#eff6ff', border: '1px solid #bfdbfe',
        borderRadius: 8, padding: '12px 16px', marginBottom: 20,
      }}>
        <div className="t-label" style={{ marginBottom: 4 }}>Waybill number</div>
        <div className="t-mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--secondary)' }}>
          {waybillNum}
        </div>
      </div>

      {/* Summary grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {summaryFields.map(([label, val]) => (
          <div key={label}>
            <div className="t-label" style={{ fontSize: 11, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 14 }}>{val || '—'}</div>
          </div>
        ))}
      </div>

      {/* Items table */}
      <table className="tbl">
        <thead>
          <tr>
            <th>Item</th>
            <th>Serial numbers dispatched</th>
            <th style={{ textAlign: 'right' }}>Qty</th>
          </tr>
        </thead>
        <tbody>
          {lines.map(l => {
            const item = ITEM_BY_ID[l.itemId]
            return (
              <tr key={l.itemId}>
                <td style={{ fontWeight: 500, fontSize: 13 }}>{item?.name}</td>
                <td>
                  {!item?.isSerialised ? (
                    <span className="muted" style={{ fontSize: 12 }}>—</span>
                  ) : l.selectedSerials.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {l.selectedSerials.map(s => (
                        <span key={s} className="t-mono" style={{
                          fontSize: 11, padding: '2px 7px', borderRadius: 4,
                          background: '#eff6ff', color: 'var(--secondary)',
                          border: '1px solid #bfdbfe',
                        }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="muted" style={{ fontSize: 12 }}>No serials selected</span>
                  )}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{l.qty}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {details.notes && (
        <div style={{ marginTop: 16, padding: 12, background: 'var(--bg)', borderRadius: 6, fontSize: 13 }}>
          <span className="t-label" style={{ marginRight: 8 }}>Notes</span>
          {details.notes}
        </div>
      )}

      <div className="muted" style={{ fontSize: 13, marginTop: 16 }}>
        Total: <strong>{totalUnits} unit{totalUnits !== 1 ? 's' : ''}</strong>{' '}
        across {lines.length} item{lines.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
