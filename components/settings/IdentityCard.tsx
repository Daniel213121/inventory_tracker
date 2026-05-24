import { FormRow } from '../ui/FormRow'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Lettermark } from '../ui/Lettermark'
import { Icon } from '../icons/Icon'
import type { Company } from '../../lib/types'

interface IdentityCardProps {
  form:    Company
  set:     (k: keyof Company, v: string) => void
  errors?: Partial<Record<keyof Company, string>>
}

export function IdentityCard({ form, set, errors = {} }: IdentityCardProps) {
  return (
    <div className="card" style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Identity</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FormRow label="Company Name" required span={2} error={errors.name}>
          <Input value={form.name} onChange={e => set('name', e.target.value)} />
        </FormRow>

        <FormRow label="Company Code" required hint="Prefix used in every waybill number — e.g. VSA" error={errors.code}>
          <Input value={form.code} onChange={e => set('code', e.target.value)} />
        </FormRow>

        <FormRow label="Tagline / Services" hint="Appears at the top of every waybill" span={2}>
          <Textarea
            value={form.tagline}
            onChange={e => set('tagline', e.target.value)}
            rows={2}
          />
        </FormRow>

        <div style={{ gridColumn: 'span 2' }}>
          <div
            className="row gap-3"
            style={{
              alignItems: 'center',
              padding: 16,
              border: '1px dashed var(--border)',
              borderRadius: 8,
              background: 'var(--bg)',
            }}
          >
            <Lettermark company={form} size={56} />
            <div className="col gap-1">
              <span style={{ fontWeight: 500, fontSize: 13 }}>Lettermark placeholder</span>
              <span className="muted" style={{ fontSize: 12 }}>
                Upload a PNG or SVG logo to replace the lettermark on waybills
              </span>
            </div>
            <button className="btn btn-secondary btn-sm row gap-2" style={{ marginLeft: 'auto' }}>
              <Icon name="upload" size={14} /> Upload logo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
