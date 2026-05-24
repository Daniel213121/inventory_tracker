'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Input }    from '@/components/ui/input'
import { Button }   from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '../ui/PageHeader'
import { FormRow }    from '../ui/FormRow'
import { Icon }       from '../icons/Icon'
import { INVENTORY, COMPANIES, CATEGORIES, CONDITIONS } from '../../lib/data'
import type { Category, InventoryItem } from '../../lib/types'

/* ─── Zod schema ─────────────────────────────────────────────────────── */

const ItemSchema = z.object({
  companyId:    z.string().min(1, 'Company is required'),
  categoryId:   z.string().min(1, 'Category is required'),
  name:         z.string().min(1, 'Item name is required'),
  brand:        z.string().min(1, 'Brand is required'),
  model:        z.string().min(1, 'Model is required'),
  condition:    z.string().min(1, 'Condition is required'),
  description:  z.string().optional(),
  threshold:    z.coerce.number().min(0, 'Must be 0 or more'),
  supplier:     z.string().optional(),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  notes:        z.string().optional(),
  quantity:     z.coerce.number().min(1, 'Must be at least 1').optional(),
})

type ItemFields = z.infer<typeof ItemSchema>

/* ─── Props ──────────────────────────────────────────────────────────── */

interface ItemFormProps {
  mode: 'add' | 'edit'
  existing?: InventoryItem
}

/* ─── Component ──────────────────────────────────────────────────────── */

export function ItemForm({ mode, existing }: ItemFormProps) {
  const router = useRouter()

  /* ── isSerialised toggle ───────────────────────────────────────── */
  const [isSerialised, setIsSerialised] = useState<boolean>(
    existing?.isSerialised ?? true
  )

  /* ── react-hook-form ───────────────────────────────────────────── */
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ItemFields>({
    resolver: zodResolver(ItemSchema) as Resolver<ItemFields>,
    defaultValues: {
      companyId:    existing?.companyId    ?? '',
      categoryId:   existing?.categoryId   ?? '',
      name:         existing?.name         ?? '',
      brand:        existing?.brand        ?? '',
      model:        existing?.model        ?? '',
      condition:    existing?.condition    ?? '',
      description:  existing?.description  ?? '',
      threshold:    existing?.threshold    ?? 5,
      supplier:     existing?.supplier     ?? '',
      purchaseDate: existing?.purchaseDate ?? '2026-05-22',
      notes:        existing?.notes        ?? '',
      quantity:     existing?.quantity     ?? 1,
    },
  })

  /* ── Category add-new ──────────────────────────────────────────── */
  const [customCategories, setCustomCategories] = useState<Category[]>([])
  const [isAddingCat, setIsAddingCat]           = useState(false)
  const [newCatLabel, setNewCatLabel]           = useState('')
  const allCategories = [...CATEGORIES, ...customCategories]

  const handleCategoryChange = (value: string) => {
    if (value === '__add_new__') { setIsAddingCat(true); return }
    setValue('categoryId', value, { shouldValidate: true })
  }

  const confirmNewCategory = () => {
    const label = newCatLabel.trim()
    if (!label) return
    const value = label.toUpperCase().replace(/\s+/g, '_')
    const id    = `cat_custom_${value.toLowerCase()}`
    setCustomCategories(prev => [...prev, { id, value, label, isDefault: false, createdAt: new Date().toISOString() }])
    setValue('categoryId', id, { shouldValidate: true })
    setIsAddingCat(false)
    setNewCatLabel('')
  }

  /* ── Multi-serial state (serialised path) ──────────────────────── */
  const [serials, setSerials]         = useState<string[]>(existing?.serial ? [existing.serial] : [])
  const [serialInput, setSerialInput] = useState('')
  const [serialError, setSerialError] = useState('')

  const addSerial = () => {
    const s = serialInput.trim().toUpperCase()
    if (!s) return
    if (serials.includes(s)) { setSerialError(`${s} already in this list`); return }
    setSerials(prev => [...prev, s])
    setSerialInput('')
    setSerialError('')
  }

  const removeSerial = (i: number) =>
    setSerials(prev => prev.filter((_, idx) => idx !== i))

  /* ── Submit ────────────────────────────────────────────────────── */
  const onSubmit = (data: ItemFields) => {
    if (isSerialised) {
      if (serials.length === 0) { setSerialError('Add at least one serial number'); return }
      if (mode === 'add') {
        const dups = serials.filter(s =>
          INVENTORY.some(i => i.serial?.toLowerCase() === s.toLowerCase())
        )
        if (dups.length > 0) { setSerialError(`Already in inventory: ${dups.join(', ')}`); return }
      }
    }

    const id = existing?.id ?? `i_${Date.now()}`

    if (mode === 'add') {
      const count = isSerialised ? serials.length : (data.quantity ?? 1)
      toast.success(
        `${count} item${count > 1 ? 's' : ''} added to inventory`,
        { description: isSerialised ? serials.join(', ') : `Qty: ${count}` }
      )
    } else {
      toast.success('Item updated', { description: data.name })
    }

    setTimeout(() => router.push(`/inventory/${id}`), 1500)
  }

  /* ── Watched values for controlled selects ─────────────────────── */
  const companyId  = watch('companyId')
  const categoryId = watch('categoryId')
  const condition  = watch('condition')

  const selectedCategoryLabel = allCategories.find(c => c.id === categoryId)?.label ?? ''

  /* ── Breadcrumb ────────────────────────────────────────────────── */
  const breadcrumb = mode === 'add'
    ? <><span onClick={() => router.push('/inventory')} style={{ cursor: 'pointer' }}>Inventory</span> <Icon name="chevronRight" size={12} /> Add new</>
    : <><span onClick={() => router.push('/inventory')} style={{ cursor: 'pointer' }}>Inventory</span> <Icon name="chevronRight" size={12} /> <span className="t-mono">{existing?.serial ?? existing?.name}</span> <Icon name="chevronRight" size={12} /> Edit</>

  return (
    <div>
      <PageHeader
        title={mode === 'add' ? 'Add New Item' : `Edit: ${existing?.name}`}
        breadcrumb={breadcrumb}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="col gap-4">

          {/* ── Card 1: Item details ──────────────────────────────── */}
          <div className="card" style={{ padding: 24 }}>
            <div className="t-h3" style={{ marginBottom: 20 }}>Item details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              <FormRow label="Company" required error={errors.companyId?.message}>
                <Select value={companyId} onValueChange={v => setValue('companyId', v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                  <SelectContent className="bg-white border border-[#E5E7EB] shadow-md">
                    {COMPANIES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormRow>

              <FormRow label="Category" required error={errors.categoryId?.message}>
                <Select value={categoryId} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category">
                      {selectedCategoryLabel || undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-[#E5E7EB] shadow-md">
                    {allCategories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                    <SelectItem value="__add_new__" className="text-[#2563EB] font-medium border-t border-[#E5E7EB] mt-1 pt-1">
                      + Add new category
                    </SelectItem>
                  </SelectContent>
                </Select>
                {isAddingCat && (
                  <div className="row gap-2" style={{ marginTop: 8 }}>
                    <Input
                      value={newCatLabel}
                      onChange={e => setNewCatLabel(e.target.value)}
                      placeholder="e.g. Accessories"
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmNewCategory() } }}
                    />
                    <Button type="button" size="sm" onClick={confirmNewCategory}
                      style={{ background: 'var(--secondary)', color: '#fff', flexShrink: 0 }}>
                      Add
                    </Button>
                    <button type="button" className="btn btn-ghost btn-sm"
                      onClick={() => { setIsAddingCat(false); setNewCatLabel('') }}>
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                )}
              </FormRow>

              <FormRow label="Item Name" required span={2} error={errors.name?.message}>
                <Input {...register('name')} placeholder="e.g. Logitech MK540 Keyboard" />
              </FormRow>

              <FormRow label="Brand" required error={errors.brand?.message}>
                <Input {...register('brand')} />
              </FormRow>

              <FormRow label="Model" required error={errors.model?.message}>
                <Input {...register('model')} />
              </FormRow>

              {/* ── Tracking method toggle ──────────────────────── */}
              <FormRow label="Tracked by" span={2}>
                <div className="row gap-2">
                  {(['serialised', 'qty'] as const).map(opt => {
                    const active = opt === 'serialised' ? isSerialised : !isSerialised
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={mode === 'edit'}
                        onClick={() => { setIsSerialised(opt === 'serialised'); setSerialError('') }}
                        style={{
                          padding: '7px 16px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                          cursor: mode === 'edit' ? 'not-allowed' : 'pointer',
                          border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                          background: active ? 'var(--primary)' : '#fff',
                          color: active ? '#fff' : 'var(--text)',
                          opacity: mode === 'edit' ? 0.6 : 1,
                        }}
                      >
                        {opt === 'serialised' ? 'Serial numbers' : 'Quantity only'}
                      </button>
                    )
                  })}
                </div>
              </FormRow>

              {/* ── Serial Numbers (serialised path) ────────────── */}
              {isSerialised && (
                <FormRow
                  label="Serial Numbers"
                  required
                  span={2}
                  hint={mode === 'add' ? 'Type each serial and press Enter — one entry per unit' : undefined}
                  error={serialError}
                >
                  <div className="row gap-2" style={{ marginBottom: 10 }}>
                    <Input
                      value={serialInput}
                      onChange={e => { setSerialInput(e.target.value); setSerialError('') }}
                      placeholder="e.g. LGT-MK540-001"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSerial() } }}
                      disabled={mode === 'edit'}
                    />
                    {mode === 'add' && (
                      <Button type="button" size="sm" onClick={addSerial}
                        style={{ background: 'var(--secondary)', color: '#fff', flexShrink: 0 }}>
                        Add
                      </Button>
                    )}
                  </div>

                  {serials.length > 0 && (
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: 8,
                      padding: 12, background: 'var(--bg)',
                      borderRadius: 8, border: '1px solid var(--border)',
                    }}>
                      {serials.map((s, i) => (
                        <div key={i} className="row gap-2" style={{
                          padding: '4px 10px', borderRadius: 6,
                          background: '#fff', border: '1px solid var(--border)',
                          fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
                        }}>
                          {s}
                          {mode === 'add' && (
                            <button type="button" onClick={() => removeSerial(i)}
                              style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                              <Icon name="x" size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {serials.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 12, color: 'var(--secondary)', fontWeight: 500 }}>
                      {serials.length} unit{serials.length > 1 ? 's' : ''} will be created
                    </div>
                  )}
                </FormRow>
              )}

              {/* ── Quantity (non-serialised path) ───────────────── */}
              {!isSerialised && (
                <FormRow label="Quantity" required error={errors.quantity?.message}>
                  <Input
                    type="number"
                    min={1}
                    {...register('quantity')}
                    disabled={mode === 'edit'}
                  />
                </FormRow>
              )}

              <FormRow label="Condition" required error={errors.condition?.message}>
                <Select value={condition} onValueChange={v => setValue('condition', v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                  <SelectContent className="bg-white border border-[#E5E7EB] shadow-md">
                    {CONDITIONS.map(c => (
                      <SelectItem key={c} value={c}>{c[0] + c.slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormRow>

              <FormRow label="Description" span={2}>
                <Textarea {...register('description')} placeholder="Specs, intended use, etc." rows={3} />
              </FormRow>
            </div>
          </div>

          {/* ── Card 2: Stock & sourcing ──────────────────────────── */}
          <div className="card" style={{ padding: 24 }}>
            <div className="t-h3" style={{ marginBottom: 20 }}>Stock &amp; sourcing</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              <FormRow label="Low Stock Threshold" hint="Alert when stock falls below this" error={errors.threshold?.message}>
                <Input type="number" min={0} {...register('threshold')} />
              </FormRow>

              <FormRow label="Supplier">
                <Input {...register('supplier')} placeholder="Persol Systems" />
              </FormRow>

              <FormRow label="Purchase Date" error={errors.purchaseDate?.message}>
                <Input type="date" {...register('purchaseDate')} />
              </FormRow>

              <FormRow label="Internal Notes" span={2}>
                <Textarea {...register('notes')} rows={3} />
              </FormRow>
            </div>
          </div>

          {/* ── Actions ───────────────────────────────────────────── */}
          <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isSubmitting}
              style={{ background: 'var(--secondary)', color: '#fff' }}
            >
              {isSubmitting ? 'Saving…' : mode === 'add'
                ? isSerialised
                  ? `Add ${serials.length > 1 ? `${serials.length} Items` : 'Item'}`
                  : 'Add Item'
                : 'Save Changes'
              }
            </Button>
          </div>

        </div>
      </form>
    </div>
  )
}
