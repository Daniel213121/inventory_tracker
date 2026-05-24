import { Lettermark } from '../ui/Lettermark'

interface CompanyOption {
  id: string; name: string; code: string; tagline: string
}

interface Props {
  companyId: string
  companies: CompanyOption[]
  onSelect:  (id: string) => void
}

export function StockOutStep1Company({ companyId, companies, onSelect }: Props) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="t-h3" style={{ marginBottom: 8 }}>Which company are you dispatching from?</div>
      <p className="muted" style={{ fontSize: 14, marginBottom: 24 }}>
        Select the company whose inventory will be reduced.
      </p>

      <div className="row gap-3">
        {companies.map(c => {
          const selected = companyId === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              style={{
                flex: 1, padding: 20, textAlign: 'left', cursor: 'pointer',
                borderRadius: 10,
                border:      `2px solid ${selected ? 'var(--secondary)' : 'var(--border)'}`,
                background:  selected ? '#eff6ff' : '#fff',
                boxShadow:   selected ? '0 0 0 4px rgba(37,99,235,0.12)' : 'none',
                transition:  'all 0.15s',
              }}
            >
              <div className="row gap-3" style={{ marginBottom: 12 }}>
                <Lettermark company={c} size={40} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {c.code}
                  </div>
                </div>
              </div>
              <div className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>{c.tagline}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
