'use client'

import { Icon } from '../icons/Icon'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import type { ReportCompany } from '@/app/actions/reports'

interface FilterStripProps {
  companies:       ReportCompany[]
  companyFilter:   string
  from:            string
  to:              string
  onCompanyChange: (v: string) => void
  onFromChange:    (v: string) => void
  onToChange:      (v: string) => void
  onRefresh:       () => void
}

export function FilterStrip({
  companies, companyFilter, from, to,
  onCompanyChange, onFromChange, onToChange, onRefresh,
}: FilterStripProps) {
  return (
    <div className="card" style={{ padding: 16, marginBottom: 24 }}>
      <div className="row gap-3" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="row gap-2" style={{ alignItems: 'center' }}>
          <span className="t-label">Company</span>
          <Select value={companyFilter || 'all'} onValueChange={v => onCompanyChange(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[160px] bg-[#F3F4F6]">
              <SelectValue placeholder="Both" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-[#E5E7EB] shadow-md">
              <SelectItem value="all">Both companies</SelectItem>
              {companies.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.code} — {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="row gap-2" style={{ alignItems: 'center' }}>
          <span className="t-label">From</span>
          <Input type="date" value={from} onChange={e => onFromChange(e.target.value)} style={{ width: 160 }} />
        </div>

        <div className="row gap-2" style={{ alignItems: 'center' }}>
          <span className="t-label">To</span>
          <Input type="date" value={to} onChange={e => onToChange(e.target.value)} style={{ width: 160 }} />
        </div>

        <button
          className="btn btn-secondary btn-sm row gap-2"
          style={{ marginLeft: 'auto' }}
          onClick={onRefresh}
        >
          <Icon name="refresh" size={14} /> Refresh
        </button>
      </div>
    </div>
  )
}
