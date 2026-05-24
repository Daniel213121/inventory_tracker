import { FormRow } from '../ui/FormRow'
import { Input } from '../ui/input'
import type { Company } from '../../lib/types'

interface ContactCardProps {
  form:    Company
  set:     (k: keyof Company, v: string) => void
  errors?: Partial<Record<keyof Company, string>>
}

export function ContactCard({ form, set, errors = {} }: ContactCardProps) {
  return (
    <div className="card" style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Addresses &amp; contact</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FormRow label="Ghana Address" span={2}>
          <Input value={form.addressGhana} onChange={e => set('addressGhana', e.target.value)} />
        </FormRow>

        <FormRow label="USA Address" span={2}>
          <Input value={form.addressUSA} onChange={e => set('addressUSA', e.target.value)} />
        </FormRow>

        <FormRow label="Ghana Phone">
          <Input value={form.phoneGhana} onChange={e => set('phoneGhana', e.target.value)} />
        </FormRow>

        <FormRow label="USA Phone">
          <Input value={form.phoneUSA} onChange={e => set('phoneUSA', e.target.value)} />
        </FormRow>

        <FormRow label="Email" error={errors.email}>
          <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
        </FormRow>

        <FormRow label="Website">
          <Input value={form.website} onChange={e => set('website', e.target.value)} />
        </FormRow>
      </div>
    </div>
  )
}
