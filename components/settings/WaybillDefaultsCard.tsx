import { FormRow } from '../ui/FormRow'
import { Input } from '../ui/input'
import type { Company } from '../../lib/types'

interface WaybillDefaultsCardProps {
  form: Company
  set: (k: keyof Company, v: string) => void
}

const year = new Date().getFullYear()

const segments = [
  { label: 'Company code',      example: (code: string) => code,   color: '#2563eb', hint: 'Set above in Identity' },
  { label: 'Destination code',  example: () => 'DEST',             color: '#7c3aed', hint: 'Entered at stock-out per shipment' },
  { label: 'Year',              example: () => String(year),        color: '#0891b2', hint: 'Auto — year of the dispatch date' },
  { label: 'Sequence',          example: () => '01',                color: '#059669', hint: 'Auto — resets per destination per year' },
]

export function WaybillDefaultsCard({ form, set }: WaybillDefaultsCardProps) {
  const parts = [form.code || 'CODE', 'DEST', String(year), '01']

  return (
    <div className="card" style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Waybill defaults</div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
        These values are pre-filled on every waybill generated for this company.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        <FormRow label="Authoriser Name" hint="Appears in the left signature block on every waybill">
          <Input value={form.authoriserName} onChange={e => set('authoriserName', e.target.value)} />
        </FormRow>

        <FormRow label="Authoriser Designation">
          <Input value={form.authoriserDesignation} onChange={e => set('authoriserDesignation', e.target.value)} />
        </FormRow>

      </div>

      {/* Waybill number format explainer */}
      <div style={{
        marginTop: 24,
        padding: 20,
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 10,
      }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Waybill number format</div>

        {/* Number preview */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 22, fontWeight: 700,
          marginBottom: 20,
        }}>
          {parts.map((part, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: segments[i].color }}>{part}</span>
              {i < parts.length - 1 && (
                <span style={{ color: '#ccc', margin: '0 2px' }}>/</span>
              )}
            </span>
          ))}
        </div>

        {/* Segment key */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {segments.map((seg, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                marginTop: 3,
                width: 10, height: 10, borderRadius: '50%',
                background: seg.color, flexShrink: 0,
              }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: seg.color }}>
                  {seg.example(form.code || 'CODE')}
                </div>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#374151' }}>{seg.label}</div>
                <div className="muted" style={{ fontSize: 11, marginTop: 1 }}>{seg.hint}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
