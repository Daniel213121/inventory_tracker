import React from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumb?: React.ReactNode
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, breadcrumb, actions }: PageHeaderProps) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16 }}>
      <div>
        {breadcrumb && (
          <div className="row gap-2 muted" style={{ fontSize: 13, marginBottom: 8 }}>
            {breadcrumb}
          </div>
        )}
        <h1 className="t-h1" style={{ margin: 0 }}>{title}</h1>
        {subtitle && (
          <div className="muted" style={{ marginTop: 6, fontSize: 14 }}>{subtitle}</div>
        )}
      </div>

      {actions && (
        <div className="row gap-2" style={{ flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  )
}
