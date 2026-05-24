import { BarChart } from '../ui/BarChart'
import { Legend }   from '../ui/Legend'
import { INVENTORY, CATEGORIES } from '../../lib/data'

const chartData = CATEGORIES.map(cat => ({
  label: cat.label,
  series: [
    {
      name: 'VSA', color: '#1E3A5F',
      value: INVENTORY.filter(i => i.companyId === 'vsa' && i.category.value === cat.value)
        .reduce((s, i) => s + i.quantity, 0),
    },
    {
      name: 'VIA', color: '#2563EB',
      value: INVENTORY.filter(i => i.companyId === 'via' && i.category.value === cat.value)
        .reduce((s, i) => s + i.quantity, 0),
    },
  ],
}))

export function StockChartCard() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div className="t-h3">Stock by Category</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
            Quantity on hand per category, by company
          </div>
        </div>
        <Legend items={[{ label: 'VSA', color: '#1E3A5F' }, { label: 'VIA', color: '#2563EB' }]} />
      </div>
      <BarChart data={chartData} height={240} />
    </div>
  )
}
