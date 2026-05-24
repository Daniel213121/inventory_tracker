import { SectionTitle }  from '../ui/SectionTitle'
import { Legend }        from '../ui/Legend'
import { BarChart }      from '../ui/BarChart'
import { CompanyChip }   from '../ui/CompanyChip'
import { ConditionBadge } from '../ui/badges'
import type { ReportInventoryItem, ReportCategory, ReportCompany } from '@/app/actions/reports'

const COMPANY_COLORS = ['#1E3A5F', '#2563EB', '#16A34A', '#D97706']

interface StockSectionProps {
  inventory:     ReportInventoryItem[]
  categories:    ReportCategory[]
  companies:     ReportCompany[]
  companyFilter: string
}

export function StockSection({ inventory, categories, companies, companyFilter }: StockSectionProps) {
  const visibleCompanies = companyFilter
    ? companies.filter(c => c.id === companyFilter)
    : companies

  const stockData = categories.map(cat => ({
    label:  cat.label,
    series: visibleCompanies.map((co, i) => ({
      name:  co.code,
      color: COMPANY_COLORS[i] ?? '#888',
      value: inventory
        .filter(item => item.companyId === co.id && item.categoryId === cat.id)
        .reduce((s, item) => s + item.quantity, 0),
    })),
  }))

  const tableItems = companyFilter
    ? inventory.filter(i => i.companyId === companyFilter)
    : inventory

  return (
    <div className="card" style={{ padding: 24, marginBottom: 24 }}>
      <SectionTitle action={
        <Legend items={visibleCompanies.map((c, i) => ({ label: c.code, color: COMPANY_COLORS[i] ?? '#888' }))} />
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
            {tableItems.slice(0, 8).map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.name}</td>
                <td className="muted" style={{ fontSize: 13 }}>{item.categoryLabel}</td>
                <td><CompanyChip code={item.companyCode} name={item.companyName} /></td>
                <td>
                  {item.qtyNew    > 0 && <ConditionBadge value="NEW" />}
                  {item.qtyUsed   > 0 && <ConditionBadge value="USED" />}
                  {item.qtyFaulty > 0 && <ConditionBadge value="FAULTY" />}
                  {item.quantity  === 0 && <span className="muted" style={{ fontSize: 12 }}>—</span>}
                </td>
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
          Showing {Math.min(8, tableItems.length)} of {tableItems.length} —{' '}
          <a href="/inventory" style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>
            view all in inventory
          </a>
        </div>
      </div>
    </div>
  )
}
