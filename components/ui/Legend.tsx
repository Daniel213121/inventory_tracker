import React from 'react'

interface LegendItem {
  label: string
  color: string
}

interface LegendProps {
  items: LegendItem[]
}

export function Legend({ items }: LegendProps) {
  return (
    <div className="row gap-4" style={{ fontSize: 13 }}>
      {items.map(item => (
        <div key={item.label} className="row gap-2">
          <span style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: 2,
            background: item.color,
            flexShrink: 0,
          }} />
          <span className="muted">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
