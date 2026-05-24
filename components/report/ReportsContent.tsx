'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { PageHeader }      from '../ui/PageHeader'
import { Loading }         from '@/components/ui/Loading'
import { Icon }            from '../icons/Icon'
import { FilterStrip }     from './FilterStrip'
import { StockSection }    from './StockSection'
import { MovementSection } from './MovementSection'
import { ItemsOutSection } from './ItemsOutSection'
import { WaybillSection }  from './WaybillSection'
import { getReportData }   from '@/app/actions/reports'
import type { ReportData } from '@/app/actions/reports'

const today         = new Date().toISOString().slice(0, 10)
const firstOfMonth  = today.slice(0, 8) + '01'

export function ReportsContent() {
  const [companyFilter, setCompanyFilter] = useState('')
  const [from,  setFrom]  = useState(firstOfMonth)
  const [to,    setTo]    = useState(today)
  const [data,  setData]  = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [rev,   setRev]   = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    const result = await getReportData({
      companyId: companyFilter || undefined,
      from,
      to,
    })
    setData(result)
    setLoading(false)
  }, [companyFilter, from, to])

  useEffect(() => { load() }, [load, rev])

  // Build day-by-day chart series from the fetched movements
  const { dayLabels, inSeries, outSeries } = useMemo(() => {
    const days: string[] = []
    const cursor = new Date(from)
    const end    = new Date(to)
    while (cursor <= end) {
      days.push(cursor.toISOString().slice(0, 10))
      cursor.setDate(cursor.getDate() + 1)
    }

    const inMap:  Record<string, number> = {}
    const outMap: Record<string, number> = {}
    days.forEach(d => { inMap[d] = 0; outMap[d] = 0 })

    for (const m of data?.movements ?? []) {
      const day = m.movedAt.slice(0, 10)
      if (inMap[day] !== undefined) {
        if (m.type === 'IN')  inMap[day]  += m.quantity
        else                  outMap[day] += m.quantity
      }
    }

    return {
      dayLabels: days.map(d => d.split('-')[2]),
      inSeries:  days.map(d => inMap[d]),
      outSeries: days.map(d => outMap[d]),
    }
  }, [data?.movements, from, to])

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
        companies={data?.companies ?? []}
        companyFilter={companyFilter}
        from={from}
        to={to}
        onCompanyChange={setCompanyFilter}
        onFromChange={setFrom}
        onToChange={setTo}
        onRefresh={() => setRev(n => n + 1)}
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Loading />
        </div>
      ) : data ? (
        <>
          <StockSection
            inventory={data.inventory}
            categories={data.categories}
            companies={data.companies}
            companyFilter={companyFilter}
          />
          <MovementSection
            dayLabels={dayLabels}
            inSeries={inSeries}
            outSeries={outSeries}
            movements={data.movements}
          />
          <ItemsOutSection dispatched={data.dispatched} />
          <WaybillSection waybills={data.waybills} />
        </>
      ) : null}
    </div>
  )
}
