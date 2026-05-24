import React from 'react'
import { Label } from './label'

interface FormRowProps {
  label: string
  hint?: string
  error?: string
  required?: boolean
  span?: number
  children: React.ReactNode
}

export function FormRow({ label, hint, error, required, span = 1, children }: FormRowProps) {
  return (
    <div style={{ gridColumn: `span ${span}` }}>
      <Label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
        {label}
        {required && <span style={{ color: 'var(--error)', marginLeft: 2 }}>*</span>}
      </Label>

      {children}

      {error
        ? <div style={{ fontSize: 12, marginTop: 4, color: 'var(--error)' }}>{error}</div>
        : hint && <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{hint}</div>
      }
    </div>
  )
}
