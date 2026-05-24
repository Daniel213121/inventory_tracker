import { SectionTitle } from '../ui/SectionTitle'
import { Legend } from '../ui/Legend'
import { BarChart } from '../ui/BarChart'
import { CompanyChip } from '../ui/CompanyChip'
import { ConditionBadge } from '../ui/badges'
import { INVENTORY, CATEGORIES } from '../../lib/data'

interface StockSectionProps {
  companyFilter: string
}

export function StockSection({ companyFilter }: StockSectionProps) {
  const stockData = CATEGORIES.map(cat => ({
    label: cat.label,
    series: [
      {
        name: 'VSA', color: '#1E3A5F',
        value: companyFilter && companyFilter !== 'vsa' ? 0 :
          INVENTORY.filter(i => i.companyId === 'vsa' && i.categoryId === cat.id)
            .reduce((s, i) => s + i.quantity, 0),
      },
      {
        name: 'VIA', color: '#2563EB',
        value: companyFilter && companyFilter !== 'via' ? 0 :
          INVENTORY.filter(i => i.companyId === 'via' && i.categoryId === cat.id)
            .reduce((s, i) => s + i.quantity, 0),
      },
    ],
  }))

  return (
    <div className="card" style={{ padding: 24, marginBottom: 24 }}>
      <SectionTitle action={
        <Legend items={[{ label: 'VSA', color: '#1E3A5F' }, { label: 'VIA', color: '#2563EB' }]} />
      }>
        1. Stock Overview
      </SectionTitle>

      <BarChart data={stockData} height={280} />

      <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginTop: 24 }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Company</th>
              <th>Condition</th>
              <th style={{ textAlign: 'right' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Threshold</th>
            </tr>
          </thead>
          <tbody>
            {INVENTORY.slice(0, 8).map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.name}</td>
                <td className="muted" style={{ fontSize: 13 }}>
                  {item.category.label}
                </td>
                <td><CompanyChip companyId={item.companyId} /></td>
                <td><ConditionBadge value={item.condition} /></td>
                <td style={{
                  textAlign: 'right', fontWeight: 600,
                  color: item.quantity < item.threshold ? 'var(--error)' : undefined,
                }}>
                  {item.quantity}
                </td>
                <td style={{ textAlign: 'right' }} className="muted">{item.threshold}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg)', fontSize: 13, color: 'var(--text-2)' }}>
          Showing 8 of {INVENTORY.length} —{' '}
          <a href="/inventory" style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>
            view all in inventory
          </a>
        </div>
      </div>
    </div>
  )
}
