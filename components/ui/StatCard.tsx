import { Icon } from '../icons/Icon'
import type { IconName } from '../icons/Icon'
import { Card } from './card'

interface StatCardProps {
  icon: IconName
  label: string
  value: string | number
  sub?: string
  accent?: string
}

export function StatCard({ icon, label, value, sub, accent = '#2563EB' }: StatCardProps) {
  return (
    <Card style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div className="row gap-3" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="row gap-3" style={{ alignItems: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${accent}15`,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}>
            <Icon name={icon} size={20} stroke={accent} />
          </div>
          <div className="t-label" style={{ margin: 0 }}>{label}</div>
        </div>

        <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em' }}>
          {value}
        </div>
      </div>

      {sub && <div className="muted" style={{ fontSize: 13, marginTop: 12 }}>{sub}</div>}
    </Card>
  )
}
