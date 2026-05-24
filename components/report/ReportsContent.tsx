'use client'

import { useMemo, useState } from 'react'
import { PageHeader } from '../ui/PageHeader'
import { Icon } from '../icons/Icon'
import { FilterStrip } from './FilterStrip'
import { StockSection } from './StockSection'
import { MovementSection } from './MovementSection'
import { ItemsOutSection } from './ItemsOutSection'
import { WaybillSection } from './WaybillSection'
import { MOVEMENTS } from '../../lib/data'

export function ReportsContent() {
  const [companyFilter, setCompanyFilter] = useState('')
  const [from, setFrom] = useState('2026-05-01')
  const [to, setTo] = useState('2026-05-22')
  const [, forceRefresh] = useState(0)

  const days = useMemo(() => {
    const result: string[] = []
    const cursor = new Date(from)
    const end = new Date(to)
    while (cursor <= end) {
      result.push(cursor.toISOString().slice(0, 10))
      cursor.setDate(cursor.getDate() + 1)
    }
    return result
  }, [from, to])

  const { inSeries, outSeries } = useMemo(() => {
    const inMap: Record<string, number> = {}
    const outMap: Record<string, number> = {}
    days.forEach(d => { inMap[d] = 0; outMap[d] = 0 })
    MOVEMENTS.forEach(m => {
      const day = m.movedAt.slice(0, 10)
      if (inMap[day] !== undefined) {
        if (m.type === 'IN') inMap[day] += m.quantity
        else outMap[day] += m.quantity
      }
    })
    return {
      inSeries: days.map(d => inMap[d]),
      outSeries: days.map(d => outMap[d]),
    }
  }, [days])

  const dayLabels = days.map(d => d.split('-')[2])

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Operational metrics across both companies"
        actions={
          <button className="btn btn-secondary btn-sm row gap-2">
            <Icon name="download" size={15} /> Export Reports
          </button>
        }
      />

      <FilterStrip
        companyFilter={companyFilter}
        from={from}
        to={to}
        onCompanyChange={setCompanyFilter}
        onFromChange={setFrom}
        onToChange={setTo}
        onRefresh={() => forceRefresh(n => n + 1)}
      />

      <StockSection companyFilter={companyFilter} />
      <MovementSection dayLabels={dayLabels} inSeries={inSeries} outSeries={outSeries} />
      <ItemsOutSection companyFilter={companyFilter} />
      <WaybillSection />
    </div>
  )
}
