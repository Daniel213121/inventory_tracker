'use client'

import { FormRow }        from '../ui/FormRow'
import { Input }          from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { ConditionValue, Movement } from '../../lib/types'

const CONDITIONS: ConditionValue[] = ['NEW', 'USED', 'FAULTY']
const CONDITION_LABEL: Record<ConditionValue, string> = {
  NEW: 'New', USED: 'Used', FAULTY: 'Faulty',
}

// For non-serialised returns
interface Props {
  movement:          Movement
  // Serialised
  returningSerials:  { serial: string; condition: ConditionValue }[]
  onToggleSerial:    (serial: string) => void
  onSerialCondition: (serial: string, condition: ConditionValue) => void
  // Non-serialised
  returningQty:      number
  condition:         ConditionValue
  onQtyChange:       (q: number) => void
  onCondition:       (v: ConditionValue) => void
  // Common
  driverName:        string
  notes:             string
  onDriverName:      (v: string) => void
  onNotes:           (v: string) => void
}

export function StockInReturnPanel({
  movement,
  returningSerials,
  onToggleSerial,
  onSerialCondition,
  returningQty,
  condition,
  onQtyChange,
  onCondition,
  driverName,
  notes,
  onDriverName,
  onNotes,
}: Props) {
  const dispatchedSerials  = movement.serialsDispatched ?? []
  const isSerialisedReturn = !!(movement.itemIsSerialised && dispatchedSerials.length > 0)
  const effectiveQty       = isSerialisedReturn ? returningSerials.length : returningQty
  const remaining          = isSerialisedReturn
    ? dispatchedSerials.length - returningSerials.length
    : movement.quantity - returningQty

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div className="t-h3" style={{ marginBottom: 4 }}>
          Returning: {movement.itemName}
        </div>
        <div className="muted" style={{ fontSize: 13 }}>
          {movement.quantity} unit{movement.quantity !== 1 ? 's' : ''} dispatched to {movement.suppliedTo} via{' '}
          <span className="t-mono" style={{ color: 'var(--secondary)', fontWeight: 600 }}>
            {movement.waybillNumber}
          </span>
        </div>
      </div>

      {/* ── Serialised: per-serial condition checkboxes ─────────── */}
      {isSerialisedReturn ? (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            Select returning serials &amp; condition
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dispatchedSerials.map(s => {
              const entry   = returningSerials.find(r => r.serial === s)
              const checked = !!entry
              return (
                <div key={s} style={{
                  borderRadius: 8,
                  border: `1px solid ${checked ? 'var(--secondary)' : 'var(--border)'}`,
                  background: checked ? '#eff6ff' : '#fff',
                  overflow: 'hidden',
                }}>
                  {/* Checkbox row */}
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleSerial(s)}
                      style={{ width: 15, height: 15, cursor: 'pointer', accentColor: 'var(--secondary)' }}
                    />
                    <span className="t-mono" style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{s}</span>
                  </label>

                  {/* Condition selector — visible only when checked */}
                  {checked && (
                    <div style={{ padding: '0 14px 12px', paddingLeft: 39 }}>
                      <div className="row gap-2">
                        {CONDITIONS.map(c => {
                          const active = entry.condition === c
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => onSerialCondition(s, c)}
                              style={{
                                padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                                border: `1px solid ${active ? 'var(--secondary)' : 'var(--border)'}`,
                                background: active ? 'var(--secondary)' : '#fff',
                                color: active ? '#fff' : 'var(--text)',
                                cursor: 'pointer',
                              }}
                            >
                              {CONDITION_LABEL[c]}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* ── Non-serialised: qty stepper + single condition ─────── */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FormRow label="Qty Returning" required hint={`Max ${movement.quantity}`}>
            <div className="row gap-2" style={{ alignItems: 'center' }}>
              <button type="button" className="btn btn-secondary btn-sm"
                onClick={() => onQtyChange(Math.max(1, returningQty - 1))}
                disabled={returningQty <= 1} style={{ width: 36, justifyContent: 'center' }}>
                −
              </button>
              <Input type="number" min={1} max={movement.quantity} value={returningQty}
                onChange={e => {
                  const v = Number(e.target.value)
                  if (v >= 1 && v <= movement.quantity) onQtyChange(v)
                }}
                style={{ width: 80, textAlign: 'center' }} />
              <button type="button" className="btn btn-secondary btn-sm"
                onClick={() => onQtyChange(Math.min(movement.quantity, returningQty + 1))}
                disabled={returningQty >= movement.quantity} style={{ width: 36, justifyContent: 'center' }}>
                +
              </button>
              <span className="muted" style={{ fontSize: 13 }}>of {movement.quantity}</span>
            </div>
          </FormRow>

          <FormRow label="Condition on Return" required hint="State of returning units">
            <Select value={condition} onValueChange={v => onCondition(v as ConditionValue)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white border border-[#E5E7EB] shadow-md">
                {CONDITIONS.map(c => <SelectItem key={c} value={c}>{CONDITION_LABEL[c]}</SelectItem>)}
              </SelectContent>
            </Select>
          </FormRow>
        </div>
      )}

      {/* ── Common fields ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FormRow label="Driver / Returned by" required hint="Person bringing items back">
          <Input
            value={driverName}
            onChange={e => onDriverName(e.target.value)}
            placeholder="e.g. John Mensah"
          />
        </FormRow>

        <FormRow label="Notes" hint="Optional remarks">
          <Input
            value={notes}
            onChange={e => onNotes(e.target.value)}
            placeholder="e.g. Minor scratches on unit 2"
          />
        </FormRow>
      </div>

      {effectiveQty > 0 && (
        <div style={{ padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, fontSize: 13 }}>
          Recording return of <strong>{effectiveQty} unit{effectiveQty !== 1 ? 's' : ''}</strong> of{' '}
          <strong>{movement.itemName}</strong>
          {!isSerialisedReturn && <> as <strong>{CONDITION_LABEL[condition]}</strong></>}
          {' '}— <strong>{remaining}</strong> unit{remaining !== 1 ? 's' : ''} remain{remaining === 1 ? 's' : ''} with {movement.suppliedTo}.
        </div>
      )}
    </div>
  )
}
