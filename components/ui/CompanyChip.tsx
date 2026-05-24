import React from 'react'
import { Lettermark } from './Lettermark'

interface CompanyChipProps {
  code: string
  name: string
}

export function CompanyChip({ code }: CompanyChipProps) {
  return (
    <span className="row gap-2" style={{ fontSize: 13 }}>
      <Lettermark company={{ code }} size={20} />
      <span style={{ fontWeight: 500 }}>{code}</span>
    </span>
  )
}
