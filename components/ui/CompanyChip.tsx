import { Lettermark } from './Lettermark'

interface CompanyChipProps {
  code:    string
  name:    string
  logoUrl?: string | null
}

export function CompanyChip({ code, logoUrl }: CompanyChipProps) {
  return (
    <span className="row gap-2" style={{ fontSize: 13 }}>
      <Lettermark company={{ code, logoUrl }} size={20} />
      <span style={{ fontWeight: 500 }}>{code}</span>
    </span>
  )
}
