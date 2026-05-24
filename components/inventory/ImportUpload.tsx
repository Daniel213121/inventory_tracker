'use client'

import { useRef, useState } from 'react'
import { Icon } from '../icons/Icon'

interface Props {
  onFile: (file: File) => void
}

export function ImportUpload({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? 'var(--secondary)' : 'var(--border)'}`,
        borderRadius: 12,
        padding: '48px 32px',
        textAlign: 'center',
        cursor: 'pointer',
        background: dragging ? '#eff6ff' : 'var(--bg)',
        transition: 'all 0.15s',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      <div style={{
        width: 56, height: 56, borderRadius: 12,
        background: '#dbeafe', display: 'grid',
        placeItems: 'center', margin: '0 auto 16px',
      }}>
        <Icon name="upload" size={26} stroke="#2563EB" />
      </div>

      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>
        Drop your Excel file here
      </div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
        Supports .xlsx, .xls, .csv — or click to browse
      </div>
      <span style={{
        display: 'inline-block', padding: '6px 16px',
        border: '1px solid var(--border)', borderRadius: 6,
        fontSize: 13, fontWeight: 500, color: 'var(--text)',
        background: '#fff',
      }}>
        Browse files
      </span>
    </div>
  )
}
