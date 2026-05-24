'use client'

import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface LineSeries {
  name: string
  color: string
  values: number[]
}

interface LineChartProps {
  labels: string[]
  series: LineSeries[]
  height?: number
}

export function LineChart({ labels, series, height = 220 }: LineChartProps) {
  const chartData = labels.map((label, i) => {
    const row: Record<string, string | number> = { label }
    series.forEach(s => { row[s.name] = s.values[i] ?? 0 })
    return row
  })

  const colorMap: Record<string, string> = {}
  series.forEach(s => { colorMap[s.name] = s.color })

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
        <Tooltip cursor={{ stroke: '#E5E7EB' }} />
        {series.map(s => (
          <Line
            key={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </ReLineChart>
    </ResponsiveContainer>
  )
}
