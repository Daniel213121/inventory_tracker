import React from 'react'

interface LettermarkProps {
  company: { id?: string; code: string }
  size?: number
}

const PALETTE: Record<string, { a: string; b: string }> = {
  vsa: { a: '#1E3A5F', b: '#2563EB' },
  via: { a: '#1E3A5F', b: '#0EA5E9' },
}

export function Lettermark({ company, size = 32 }: LettermarkProps) {
  const { a, b } = PALETTE[company.id ?? ''] ?? { a: '#1E3A5F', b: '#2563EB' }

  return (
    <div
      className="lettermark"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, ${a}, ${b})`,
      }}
    >
      {company.code}
    </div>
  )
}
