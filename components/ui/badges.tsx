import React from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { CONDITION_LABEL } from '../../lib/utils'
import type { ConditionValue, MovementType } from '../../lib/types'

const KIND_CLASS: Record<string, string> = {
  NEW:      'badge-new',
  USED:     'badge-used',
  FAULTY:   'badge-faulty',
  IN:       'badge-in',
  OUT:      'badge-out',
  active:   'badge-active',
  inactive: 'badge-inactive',
  low:      'badge-low',
}

export function KindBadge({ kind, children }: { kind: string; children: React.ReactNode }) {
  return <span className={`badge ${KIND_CLASS[kind] ?? ''}`}>{children}</span>
}

export function ConditionBadge({ value }: { value: ConditionValue }) {
  return <KindBadge kind={value}>{CONDITION_LABEL[value]}</KindBadge>
}

export function MovementBadge({ type }: { type: MovementType }) {
  return (
    <KindBadge kind={type}>
      {type === 'IN' ? <ArrowDown size={11} strokeWidth={2.4} /> : <ArrowUp size={11} strokeWidth={2.4} />}
      {type}
    </KindBadge>
  )
}

export function StatusBadge({ active }: { active: boolean }) {
  return <KindBadge kind={active ? 'active' : 'inactive'}>{active ? 'Active' : 'Inactive'}</KindBadge>
}
