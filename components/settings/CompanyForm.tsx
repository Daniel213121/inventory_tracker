'use client'

import { useState }      from 'react'
import { z }             from 'zod'
import { toast }         from 'sonner'
import { IdentityCard }  from './IdentityCard'
import { ContactCard }   from './ContactCard'
import { WaybillDefaultsCard } from './WaybillDefaultsCard'
import { updateCompany } from '@/app/actions/settings'
import type { Company }  from '../../lib/types'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const companySchema = z.object({
  name:  z.string().min(1, 'Company name is required'),
  code:  z.string().min(1, 'Company code is required').max(5, 'Code must be 5 characters or fewer'),
  email: z.string().refine(v => v === '' || emailRegex.test(v), 'Invalid email address'),
})

type FormErrors = Partial<Record<keyof Company, string>>

interface CompanyFormProps {
  company: Company
  onSave:  (updated: Company) => void
}

export function CompanyForm({ company, onSave }: CompanyFormProps) {
  const [form,    setForm]    = useState<Company>({ ...company })
  const [errors,  setErrors]  = useState<FormErrors>({})
  const [saving,  setSaving]  = useState(false)

  function set(k: keyof Company, v: string) {
    setForm(prev => ({ ...prev, [k]: k === 'waybillSequence' ? Number(v) : v }))
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const result = companySchema.safeParse({ name: form.name, code: form.code, email: form.email })
    if (!result.success) {
      const fieldErrors: FormErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Company
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setSaving(true)
    try {
      const updated = await updateCompany(company.id, {
        name:                  form.name,
        tagline:               form.tagline,
        taglineLine2:          form.taglineLine2,
        fullName:              form.fullName,
        addressGhana:          form.addressGhana,
        addressUSA:            form.addressUSA,
        phoneGhana:            form.phoneGhana,
        mobileGhana:           form.mobileGhana,
        phoneUSA:              form.phoneUSA,
        email:                 form.email,
        website:               form.website,
        brandSubtitle:         form.brandSubtitle,
        authoriserName:        form.authoriserName,
        authoriserDesignation: form.authoriserDesignation,
        logoUrl:               form.logoUrl,
      })
      onSave(updated as unknown as Company)
      toast.success(`${updated.name} settings saved`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <IdentityCard      form={form} set={set} errors={errors} />
      <ContactCard       form={form} set={set} errors={errors} />
      <WaybillDefaultsCard form={form} set={set} />

      <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => { setForm({ ...company }); setErrors({}) }}
          disabled={saving}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
