import { Lettermark } from '../ui/Lettermark'
import { Icon } from '../icons/Icon'
import type { Company } from '../../lib/types'

interface SettingsNavProps {
  companies: Company[]
  active:    string
  onSelect:  (id: string) => void
}

export function SettingsNav({ companies, active, onSelect }: SettingsNavProps) {
  return (
    <div className="col gap-2">
      <span className="t-label" style={{ marginBottom: 4, paddingLeft: 12 }}>Companies</span>

      {companies.map(c => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className="row gap-3"
          style={{
            borderRadius: 8,
            padding: 12,
            border:     active === c.id ? '1px solid var(--border)' : '1px solid transparent',
            background: active === c.id ? '#fff' : 'transparent',
            boxShadow:  active === c.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
            textAlign: 'left',
            width: '100%',
            cursor: 'pointer',
          }}
        >
          <Lettermark company={c} size={32} />
          <div className="col" style={{ overflow: 'hidden' }}>
            <span style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {c.name}
            </span>
            <span className="muted" style={{ fontSize: 12 }}>{c.code}</span>
          </div>
        </button>
      ))}

      <span className="t-label" style={{ marginTop: 16, marginBottom: 4, paddingLeft: 12 }}>System</span>

      {[
        { icon: 'bell',     label: 'Notifications'      },
        { icon: 'key',      label: 'Security & access'  },
        { icon: 'document', label: 'Waybill templates'  },
      ].map(item => (
        <button
          key={item.label}
          className="row gap-3 muted"
          style={{ fontSize: 13, padding: 12, borderRadius: 8, border: '1px solid transparent', background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer' }}
        >
          <Icon name={item.icon as 'bell' | 'key' | 'document'} size={16} stroke="var(--text-2)" />
          {item.label}
        </button>
      ))}
    </div>
  )
}
