'use client'

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface BarSeries {
  name: string
  value: number
  color: string
}

interface BarGroup {
  label: string
  series: BarSeries[]
}

interface BarChartProps {
  data: BarGroup[]
  height?: number
  formatValue?: (v: number) => string | number
}

export function BarChart({ data, height = 260, formatValue = v => v }: BarChartProps) {
  const seriesKeys = data[0]?.series.map(s => s.name) ?? []
  const colorMap: Record<string, string> = {}
  data[0]?.series.forEach(s => { colorMap[s.name] = s.color })

  const chartData = data.map(g => {
    const row: Record<string, string | number> = { label: g.label }
    g.series.forEach(s => { row[s.name] = s.value })
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={v => String(formatValue(v))} tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} width={32} />
        <Tooltip formatter={(v) => (typeof v === 'number' ? formatValue(v) : v)} cursor={{ fill: '#F3F4F6' }} />
        {seriesKeys.map(key => (
          <Bar key={key} dataKey={key} fill={colorMap[key]} radius={[3, 3, 0, 0]} maxBarSize={28} />
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  )
}
