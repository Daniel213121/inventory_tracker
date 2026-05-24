'use client'

import { SearchBar } from '../ui/SearchBar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATEGORIES, CONDITIONS } from '../../lib/data'
import { COMPANIES } from '../../lib/data'

interface Props {
  q: string
  company: string
  cat: string
  cond: string
  onQ: (v: string) => void
  onCompany: (v: string) => void
  onCat: (v: string) => void
  onCond: (v: string) => void
}

export function InventoryFilters({ q, company, cat, cond, onQ, onCompany, onCat, onCond }: Props) {
  return (
    <div
      className="row"
      style={{
        padding: 16,
        borderBottom: '1px solid var(--border)',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <SearchBar
        value={q}
        onChange={onQ}
        width={360}
        placeholder="Search by name, serial, brand, or model…"
      />

      <div className="row gap-2" style={{ marginLeft: 'auto' }}>
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

        <Select value={cat} onValueChange={onCat}>
          <SelectTrigger className="w-[160px] bg-[#F3F4F6]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-[#E5E7EB] shadow-md">
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={cond} onValueChange={onCond}>
          <SelectTrigger className="w-[150px] bg-[#F3F4F6]">
            <SelectValue placeholder="All conditions" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-[#E5E7EB] shadow-md">
            <SelectItem value="all">All conditions</SelectItem>
            {CONDITIONS.map(c => (
              <SelectItem key={c} value={c}>{c[0] + c.slice(1).toLowerCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
