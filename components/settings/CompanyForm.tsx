'use client'

import { useState } from 'react'
import { z } from 'zod'
import { IdentityCard } from './IdentityCard'
import { ContactCard } from './ContactCard'
import { WaybillDefaultsCard } from './WaybillDefaultsCard'
import { COMPANY_BY_ID } from '../../lib/data'
import type { Company } from '../../lib/types'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const companySchema = z.object({
  name:  z.string().min(1, 'Company name is required'),
  code:  z.string().min(1, 'Company code is required').max(5, 'Code must be 5 characters or fewer'),
  email: z.string().refine(v => v === '' || emailRegex.test(v), 'Invalid email address'),
})

type FormErrors = Partial<Record<keyof Company, string>>

interface CompanyFormProps {
  companyId: string
  onSave: (updated: Company) => void
}

export function CompanyForm({ companyId, onSave }: CompanyFormProps) {
  const [form, setForm]     = useState<Company>({ ...COMPANY_BY_ID[companyId] })
  const [errors, setErrors] = useState<FormErrors>({})

  function set(k: keyof Company, v: string) {
    setForm(prev => ({ ...prev, [k]: k === 'waybillSequence' ? Number(v) : v }))
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: undefined }))
  }

  function handleSubmit(e: React.FormEvent) {
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
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <IdentityCard form={form} set={set} errors={errors} />
      <ContactCard form={form} set={set} errors={errors} />
      <WaybillDefaultsCard form={form} set={set} />

      <div className="row" style={{ justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => { setForm({ ...COMPANY_BY_ID[companyId] }); setErrors({}) }}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save changes
        </button>
      </div>
    </form>
  )
}
