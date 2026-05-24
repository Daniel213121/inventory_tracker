'use client'

import React from 'react'
import { Icon } from '../icons/Icon'

interface TweaksPanelProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

interface TweakSectionProps {
  label: string
  children: React.ReactNode
}

interface TweakRadioProps {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}

export function TweaksPanel({ open, onClose, title = 'Tweaks', children }: TweaksPanelProps) {
  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 280,
        height: '100vh',
        background: '#fff',
        borderLeft: '1px solid var(--border)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{title}</span>
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            padding: 4,
            borderRadius: 6,
            color: 'var(--text-2)',
            cursor: 'pointer',
          }}
        >
          <Icon name="x" size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {children}
      </div>
    </aside>
  )
}

export function TweakSection({ label, children }: TweakSectionProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="t-label" style={{ marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  )
}

export function TweakRadio({ label, value, options, onChange }: TweakRadioProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {options.map(opt => {
          const selected = opt.value === value
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              style={{
                padding: '5px 12px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                border: `1px solid ${selected ? 'var(--secondary)' : 'var(--border)'}`,
                background: selected ? 'var(--secondary)' : '#fff',
                color: selected ? '#fff' : 'var(--text)',
                cursor: 'pointer',
                transition: 'background 0.12s, border-color 0.12s, color 0.12s',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
