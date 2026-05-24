'use client'

import { useRef, useState } from 'react'
import { toast }     from 'sonner'
import { FormRow }   from '../ui/FormRow'
import { Input }     from '../ui/input'
import { Textarea }  from '../ui/textarea'
import { Lettermark } from '../ui/Lettermark'
import { Icon }      from '../icons/Icon'
import type { Company } from '../../lib/types'

interface IdentityCardProps {
  form:    Company
  set:     (k: keyof Company, v: string) => void
  errors?: Partial<Record<keyof Company, string>>
}

export function IdentityCard({ form, set, errors = {} }: IdentityCardProps) {
  const fileRef    = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json() as { url?: string; error?: string }
      if (!res.ok) throw new Error(json.error ?? 'Upload failed')
      set('logoUrl', json.url!)
      toast.success('Logo uploaded — click Save changes to apply')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      // reset so the same file can be re-selected if needed
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const logoUrl = form.logoUrl ?? null

  return (
    <div className="card" style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Identity</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <FormRow label="Company Name" required span={2} error={errors.name}>
          <Input value={form.name} onChange={e => set('name', e.target.value)} />
        </FormRow>

        <FormRow label="Company Code" required hint="Prefix used in every waybill number — e.g. VSA" error={errors.code}>
          <Input value={form.code} onChange={e => set('code', e.target.value)} />
        </FormRow>

        <FormRow label="Tagline / Services" hint="Appears at the top of every waybill" span={2}>
          <Textarea
            value={form.tagline}
            onChange={e => set('tagline', e.target.value)}
            rows={2}
          />
        </FormRow>

        <div style={{ gridColumn: 'span 2' }}>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <div
            className="row gap-3"
            style={{
              alignItems: 'center',
              padding: 16,
              border: '1px dashed var(--border)',
              borderRadius: 8,
              background: 'var(--bg)',
            }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Company logo"
                style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 6 }}
              />
            ) : (
              <Lettermark company={form} size={56} />
            )}
            <div className="col gap-1">
              <span style={{ fontWeight: 500, fontSize: 13 }}>
                {logoUrl ? 'Company logo' : 'Lettermark placeholder'}
              </span>
              <span className="muted" style={{ fontSize: 12 }}>
                {logoUrl
                  ? 'Upload a new image to replace the current logo'
                  : 'Upload a PNG or JPG logo to replace the lettermark on waybills'}
              </span>
            </div>
            <div className="row gap-2" style={{ marginLeft: 'auto' }}>
              {logoUrl && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--error)' }}
                  onClick={() => set('logoUrl', '')}
                >
                  Remove
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary btn-sm row gap-2"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                <Icon name="upload" size={14} />
                {uploading ? 'Uploading…' : 'Upload logo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
