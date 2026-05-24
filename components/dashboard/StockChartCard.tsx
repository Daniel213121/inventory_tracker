import { BarChart } from '../ui/BarChart'
import { Legend }   from '../ui/Legend'
import type { DashboardInventorySummary } from '@/app/actions/dashboard'

const COMPANY_COLORS = ['#1E3A5F', '#2563EB', '#16A34A', '#D97706']

interface StockChartCardProps {
  companies:  { id: string; name: string; code: string }[]
  categories: { id: string; label: string }[]
  inventory:  DashboardInventorySummary[]
}

export function StockChartCard({ companies, categories, inventory }: StockChartCardProps) {
  const chartData = categories.map(cat => ({
    label: cat.label,
    series: companies.map((co, i) => ({
      name:  co.code,
      color: COMPANY_COLORS[i] ?? '#888',
      value: inventory
        .filter(item => item.companyId === co.id && item.categoryId === cat.id)
        .reduce((s, item) => s + item.quantity, 0),
    })),
  }))

  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div className="t-h3">Stock by Category</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
            Quantity on hand per category, by company
          </div>
        </div>
        <Legend items={companies.map((c, i) => ({ label: c.code, color: COMPANY_COLORS[i] ?? '#888' }))} />
      </div>
      <BarChart data={chartData} height={240} />
    </div>
  )
}
