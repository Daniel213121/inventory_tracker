'use client'

import { FormRow } from '../ui/FormRow'
import { Input }   from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
interface Props {
  companyId: string
  date:      string
  search:    string
  companies: { id: string; name: string }[]
  onCompany: (id: string) => void
  onDate:    (v: string)  => void
  onSearch:  (v: string)  => void
}

export function StockInFilters({ companyId, date, search, companies, onCompany, onDate, onSearch }: Props) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="t-h3" style={{ marginBottom: 16 }}>Return details</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        <FormRow label="Company" required>
          <Select value={companyId} onValueChange={onCompany}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white border border-[#E5E7EB] shadow-md">
              {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormRow>

        <FormRow label="Date of Return" required>
          <Input type="date" value={date} onChange={e => onDate(e.target.value)} />
        </FormRow>

        <FormRow label="Search" span={2} hint="Filter by waybill number, supplier, item name or serial">
          <Input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="e.g. VSA/TGB, Samsung, TG Bank, SN001…"
          />
        </FormRow>

      </div>
    </div>
  )
}
