import { StatCard } from '../ui/StatCard'
import { INVENTORY, MOVEMENTS, WAYBILLS } from '../../lib/data'

const totalItems = INVENTORY.reduce((s, i) => s + i.quantity, 0)

const itemsOut =
  MOVEMENTS.filter(m => m.type === 'OUT').reduce((s, m) => s + m.quantity, 0) -
  MOVEMENTS.filter(m => m.type === 'IN' && m.condBefore != null).reduce((s, m) => s + m.quantity, 0)

export function DashboardStats() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
      <StatCard
        icon="package"
        label="Total Inventory Items"
        value={totalItems.toLocaleString()}
      />
      <StatCard
        icon="truck"
        label="Items Currently Out"
        value={Math.max(0, itemsOut)}
        accent="#D97706"
      />
      <StatCard
        icon="document"
        label="Waybills Generated"
        value={WAYBILLS.length}
        accent="#16A34A"
      />
    </div>
  )
}
