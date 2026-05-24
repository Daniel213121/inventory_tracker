'use client'

import { useEffect, useState }  from 'react'
import { useRouter }            from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver }          from '@hookform/resolvers/zod'
import { z }                    from 'zod'
import { toast }                from 'sonner'
import { Input }                from '@/components/ui/input'
import { Button }               from '@/components/ui/button'
import { Textarea }             from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { PageHeader }           from '../ui/PageHeader'
import { FormRow }              from '../ui/FormRow'
import { Icon }                 from '../icons/Icon'
import { CONDITIONS }           from '../../lib/utils'
import {
  createInventoryItem,
  updateInventoryItem,
  listCategories,
  createCategory,
} from '@/app/actions/inventory'
import { listCompanies }        from '@/app/actions/settings'
import type { Category, InventoryItem } from '../../lib/types'

/* ─── Schema ─────────────────────────────────────────────────────────── */

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
  mode:      'add' | 'edit'
  existing?: InventoryItem
}

/* ─── Component ──────────────────────────────────────────────────────── */

export function ItemForm({ mode, existing }: ItemFormProps) {
  const router = useRouter()

  /* ── Reference data ────────────────────────────────────────────── */
  const [companies,  setCompanies]  = useState<{ id: string; name: string }[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    Promise.all([listCompanies(), listCategories()]).then(([cos, cats]) => {
      setCompanies(cos.map(c => ({ id: c.id, name: c.name })))
      setCategories(cats as Category[])
    })
  }, [])

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
      condition:    '',
      description:  existing?.description  ?? '',
      threshold:    existing?.threshold    ?? 5,
      supplier:     existing?.supplier     ?? '',
      purchaseDate: existing?.purchaseDate ?? new Date().toISOString().slice(0, 10),
      notes:        existing?.notes        ?? '',
      quantity:     existing?.quantity     ?? 1,
    },
  })

  /* ── Category add-new ──────────────────────────────────────────── */
  const [isAddingCat,  setIsAddingCat]  = useState(false)
  const [newCatLabel,  setNewCatLabel]  = useState('')
  const [catSaving,    setCatSaving]    = useState(false)

  const handleCategoryChange = (value: string) => {
    if (value === '__add_new__') { setIsAddingCat(true); return }
    setValue('categoryId', value, { shouldValidate: true })
  }

  const confirmNewCategory = async () => {
    const label = newCatLabel.trim()
    if (!label) return
    setCatSaving(true)
    try {
      const cat = await createCategory(label)
      setCategories(prev => [...prev, cat as Category])
      setValue('categoryId', cat.id, { shouldValidate: true })
      setIsAddingCat(false)
      setNewCatLabel('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setCatSaving(false)
    }
  }

  /* ── Image upload state ────────────────────────────────────────── */
  const [imageUrl,      setImageUrl]      = useState<string | null>(existing?.imageUrl ?? null)
  const [imageUploading, setImageUploading] = useState(false)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Upload failed')
      const { url } = await res.json()
      setImageUrl(url)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setImageUploading(false)
    }
  }

  /* ── Multi-serial state ────────────────────────────────────────── */
  const [serials,      setSerials]      = useState<string[]>(existing?.serialUnits.map(u => u.serial) ?? [])
  const [serialInput,  setSerialInput]  = useState('')
  const [serialError,  setSerialError]  = useState('')

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
  const onSubmit = async (data: ItemFields) => {
    if (isSerialised && serials.length === 0) {
      setSerialError('Add at least one serial number')
      return
    }

    try {
      if (mode === 'add') {
        const item = await createInventoryItem({
          companyId:    data.companyId,
          categoryId:   data.categoryId,
          name:         data.name,
          brand:        data.brand,
          model:        data.model,
          isSerialised,
          serials:      isSerialised ? serials : [],
          condition:    data.condition,
          quantity:     isSerialised ? serials.length : (data.quantity ?? 1),
          threshold:    data.threshold,
          supplier:     data.supplier,
          purchaseDate: data.purchaseDate,
          description:  data.description,
          notes:        data.notes,
          imageUrl,
        })
        const count = isSerialised ? serials.length : (data.quantity ?? 1)
        toast.success(
          `${count} item${count > 1 ? 's' : ''} added to inventory`,
          { description: isSerialised ? serials.join(', ') : `Qty: ${count}` }
        )
        router.push(`/inventory/${item.id}`)
      } else if (existing) {
        await updateInventoryItem(existing.id, {
          categoryId:   data.categoryId,
          name:         data.name,
          brand:        data.brand,
          model:        data.model,
          threshold:    data.threshold,
          supplier:     data.supplier ?? null,
          purchaseDate: data.purchaseDate,
          description:  data.description ?? null,
          notes:        data.notes ?? null,
          imageUrl,
        })
        toast.success('Item updated', { description: data.name })
        router.push(`/inventory/${existing.id}`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  /* ── Watched values for controlled selects ─────────────────────── */
  const companyId  = watch('companyId')
  const categoryId = watch('categoryId')
  const condition  = watch('condition')

  /* ── Breadcrumb ────────────────────────────────────────────────── */
  const breadcrumb = mode === 'add'
    ? <><span onClick={() => router.push('/inventory')} style={{ cursor: 'pointer' }}>Inventory</span> <Icon name="chevronRight" size={12} /> Add new</>
    : <><span onClick={() => router.push('/inventory')} style={{ cursor: 'pointer' }}>Inventory</span> <Icon name="chevronRight" size={12} /> <span className="t-mono">{existing?.serialUnits[0]?.serial ?? existing?.name}</span> <Icon name="chevronRight" size={12} /> Edit</>

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
                    {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormRow>

              <FormRow label="Category" required error={errors.categoryId?.message}>
                <Select value={categoryId} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-[#E5E7EB] shadow-md">
                    {categories.map(c => (
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
                    <Button type="button" size="sm" onClick={confirmNewCategory} disabled={catSaving}
                      style={{ background: 'var(--secondary)', color: '#fff', flexShrink: 0 }}>
                      {catSaving ? '…' : 'Add'}
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

              {/* ── Serial Numbers ───────────────────────────────── */}
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

              {/* ── Quantity (non-serialised) ────────────────────── */}
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

              {mode === 'add' ? (
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
              ) : (
                <FormRow label="Condition" hint="Managed through stock-in / stock-out movements">
                  <div className="row gap-2" style={{ flexWrap: 'wrap', paddingTop: 4 }}>
                    {existing && existing.qtyNew    > 0 && <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6, background: '#dcfce7', color: '#15803d', fontWeight: 500 }}>New ×{existing.qtyNew}</span>}
                    {existing && existing.qtyUsed   > 0 && <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6, background: '#fef9c3', color: '#854d0e', fontWeight: 500 }}>Used ×{existing.qtyUsed}</span>}
                    {existing && existing.qtyFaulty > 0 && <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6, background: '#fee2e2', color: '#991b1b', fontWeight: 500 }}>Faulty ×{existing.qtyFaulty}</span>}
                    {existing && existing.quantity  === 0 && <span className="muted" style={{ fontSize: 13 }}>No stock in</span>}
                  </div>
                </FormRow>
              )}

              <FormRow label="Description" span={2}>
                <Textarea {...register('description')} placeholder="Specs, intended use, etc." rows={3} />
              </FormRow>
            </div>
          </div>

          {/* ── Card 2: Image ────────────────────────────────────── */}
          <div className="card" style={{ padding: 24 }}>
            <div className="t-h3" style={{ marginBottom: 20 }}>Item image</div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

              {/* Preview / placeholder */}
              <div style={{
                width: 160, height: 160, flexShrink: 0,
                border: '2px dashed var(--border)', borderRadius: 10,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg)', overflow: 'hidden',
              }}>
                {imageUrl
                  ? <img src={imageUrl} alt="Item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <>
                      <Icon name="package" size={36} stroke="var(--border)" />
                      <span className="muted" style={{ fontSize: 12, marginTop: 8 }}>No image</span>
                    </>
                }
              </div>

              {/* Controls */}
              <div className="col gap-3" style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Upload a photo of the item. JPEG, PNG or WebP, max 5 MB.
                </div>
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                  border: '1px solid var(--border)', background: '#fff',
                  cursor: imageUploading ? 'wait' : 'pointer',
                  opacity: imageUploading ? 0.7 : 1,
                }}>
                  <Icon name="upload" size={14} />
                  {imageUploading ? 'Uploading…' : imageUrl ? 'Replace image' : 'Upload image'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                    disabled={imageUploading}
                  />
                </label>
                {imageUrl && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--error)', alignSelf: 'flex-start' }}
                    onClick={() => setImageUrl(null)}
                  >
                    Remove image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Card 3: Stock & sourcing ──────────────────────────── */}
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
