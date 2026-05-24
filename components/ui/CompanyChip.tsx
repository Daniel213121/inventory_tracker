import React from 'react'
import { COMPANY_BY_ID } from '../../lib/data'
import { Lettermark } from './Lettermark'

interface CompanyChipProps {
  companyId: string
}

export function CompanyChip({ companyId }: CompanyChipProps) {
  const c = COMPANY_BY_ID[companyId]
  if (!c) return null

  return (
    <span className="row gap-2" style={{ fontSize: 13 }}>
      <Lettermark company={c} size={20} />
      <span style={{ fontWeight: 500 }}>{c.code}</span>
    </span>
  )
}
