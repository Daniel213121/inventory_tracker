import { Icon } from '../icons/Icon'

const STEP_LABELS = ['Select Company', 'Select Items', 'Movement Details', 'Review & Confirm']

interface Props {
  step: number
}

export function StepIndicator({ step }: Props) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
      <div className="row" style={{ padding: '16px 20px', gap: 0 }}>
        {STEP_LABELS.map((label, i) => {
          const n      = i + 1
          const active = step === n
          const done   = step > n
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <div className="row gap-3" style={{ flex: 1, minWidth: 0 }}>
                <div className={`step-num${active ? ' active' : done ? ' done' : ''}`}>
                  {done ? <Icon name="check" size={14} stroke="#fff" /> : n}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 12, fontWeight: 600,
                    color: active ? 'var(--secondary)' : done ? 'var(--success)' : 'var(--text-2)',
                  }}>
                    Step {n}
                  </div>
                  <div style={{
                    fontSize: 13, fontWeight: 500,
                    color: active ? 'var(--text)' : 'var(--text-2)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {label}
                  </div>
                </div>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div style={{ width: 1, height: 32, background: 'var(--border)', flexShrink: 0, margin: '0 12px' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
