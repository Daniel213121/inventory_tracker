import React from 'react'
import { Input } from './input'
import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  width?: number | string
}

export function SearchBar({ value, onChange, placeholder = 'Search…', width = 320 }: SearchBarProps) {
  return (
    <div style={{ width, position: 'relative' }}>
      <Search
        size={16}
        color="#9ca3af"
        style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}
      />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ paddingLeft: 36 }}
      />
    </div>
  )
}
