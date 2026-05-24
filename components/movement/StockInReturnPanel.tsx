'use client'

import { FormRow }      from '../ui/FormRow'
import { Input }        from '@/components/ui/input'
import { ConditionBadge } from '../ui/badges'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { CONDITIONS, CONDITION_LABEL } from '../../lib/data'
import type { ConditionValue, InventoryItem, Movement, Waybill } from '../../lib/types'

interface Props {
  movement:         Movement
  item:             InventoryItem
  waybill:          Waybill | null
  returningSerials: string[]
  returningQty:     number
  condition:        ConditionValue
  onToggleSerial:   (s: string) => void
  onQtyChange:      (q: number) => void
  onCondition:      (v: ConditionValue) => void
}

export function StockInReturnPanel({
  movement,
  item,
  waybill,
  returningSerials,
  returningQty,
  condition,
  onToggleSerial,
  onQtyChange,
  onCondition,
}: Props) {
  const dispatchedSerials  = movement.serialsDispatched ?? []
  const isSerialisedReturn = !!(item.isSerialised && dispatchedSerials.length > 0)
  const effectiveQty       = isSerialisedReturn ? returningSerials.length : returningQty
  const remaining          = isSerialisedReturn
    ? dispatchedSerials.length - returningSerials.length
    : movement.quantity - returningQty

  return (
    <div className="card" style={{ padding: 24, border: '2px solid #bfdbfe' }}>
      <div className="t-h3" style={{ marginBottom: 4 }}>
        Returning: {item.name}
      </div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
        {movement.quantity} unit{movement.quantity !== 1 ? 's' : ''} dispatched to {movement.suppliedTo} via{' '}
        <span className="t-mono" style={{ color: 'var(--secondary)', fontWeight: 600 }}>
          {waybill?.number}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {isSerialisedReturn ? (
          <FormRow label="Serial Numbers Returning" required
            hint="Tick each serial that is physically coming back">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
              {dispatchedSerials.map(s => {
                const checked = returningSerials.includes(s)
                return (
                  <label key={s} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
                    border: `1px solid ${checked ? 'var(--secondary)' : 'var(--border)'}`,
                    background: checked ? '#eff6ff' : '#fff',
                  }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleSerial(s)}
                      style={{ width: 15, height: 15, cursor: 'pointer', accentColor: 'var(--secondary)' }}
                    />
                    <span className="t-mono" style={{ fontSize: 13, fontWeight: 500 }}>{s}</span>
                  </label>
                )
              })}
            </div>
          </FormRow>
        ) : (
          <FormRow label="Qty Returning" required
            hint={`Max ${movement.quantity} — only what's coming back now`}>
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
        )}

        <FormRow label="Condition on Return" required hint="State of returning units">
          <Select value={condition} onValueChange={v => onCondition(v as ConditionValue)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white border border-[#E5E7EB] shadow-md">
              {CONDITIONS.map(c => <SelectItem key={c} value={c}>{CONDITION_LABEL[c]}</SelectItem>)}
            </SelectContent>
          </Select>
        </FormRow>

      </div>

      {effectiveQty > 0 && (
        <div style={{
          marginTop: 16, padding: '10px 14px',
          background: 'var(--bg)', borderRadius: 8, fontSize: 13,
        }}>
          Recording return of <strong>{effectiveQty} × {item.name}</strong>{' '}
          as <ConditionBadge value={condition} />{' '}
          — <strong>{remaining}</strong> unit{remaining !== 1 ? 's' : ''} remain{remaining === 1 ? 's' : ''} with {movement.suppliedTo}.
        </div>
      )}
    </div>
  )
}
