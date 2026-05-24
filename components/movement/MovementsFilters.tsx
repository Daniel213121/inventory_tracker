'use client'

import { SearchBar } from '../ui/SearchBar'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { COMPANIES } from '../../lib/data'

interface Props {
  q: string
  type: string
  company: string
  onQ: (v: string) => void
  onType: (v: string) => void
  onCompany: (v: string) => void
}

export function MovementsFilters({ q, type, company, onQ, onType, onCompany }: Props) {
  return (
    <div className="row" style={{ padding: 16, borderBottom: '1px solid var(--border)', gap: 12, flexWrap: 'wrap' }}>
      <SearchBar value={q} onChange={onQ} width={360} placeholder="Search item, serial, destination, recipient…" />

      <div className="row gap-2" style={{ marginLeft: 'auto' }}>
        <Select value={type} onValueChange={onType}>
          <SelectTrigger className="w-[140px] bg-[#F3F4F6]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-[#E5E7EB] shadow-md">
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="IN">Stock In</SelectItem>
            <SelectItem value="OUT">Stock Out</SelectItem>
          </SelectContent>
        </Select>

        <Select value={company} onValueChange={onCompany}>
          <SelectTrigger className="w-[160px] bg-[#F3F4F6]">
            <SelectValue placeholder="All companies" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-[#E5E7EB] shadow-md">
            <SelectItem value="all">All companies</SelectItem>
            {COMPANIES.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
