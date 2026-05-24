import React from 'react'

interface SectionTitleProps {
  children: React.ReactNode
  action?: React.ReactNode
}

export function SectionTitle({ children, action }: SectionTitleProps) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
      <h2 className="t-h3" style={{ margin: 0 }}>{children}</h2>
      {action}
    </div>
  )
}
