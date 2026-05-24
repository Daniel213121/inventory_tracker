import { StatCard } from '../ui/StatCard'

interface DashboardStatsProps {
  totalItems:   number
  itemsOut:     number
  waybillCount: number
}

export function DashboardStats({ totalItems, itemsOut, waybillCount }: DashboardStatsProps) {
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
        value={itemsOut}
        accent="#D97706"
      />
      <StatCard
        icon="document"
        label="Waybills Generated"
        value={waybillCount}
        accent="#16A34A"
      />
    </div>
  )
}
