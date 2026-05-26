'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { forwardRef, useImperativeHandle } from 'react'
import { FormRow } from '../ui/FormRow'
import { Input }    from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Details } from './stockout-types'

/* ─── Auto-suggest destination code from full name ───────────────────── */

export function suggestDestCode(suppliedTo: string): string {
  const SKIP = new Set(['the', 'of', 'and', 'to', 'at', 'a', 'an', 'for', 'in'])
  const words = suppliedTo
    .split(/[\s—\-]+/)
    .map(w => w.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(w => w.length > 0 && !SKIP.has(w.toLowerCase()))

  if (words.length === 0) return ''

  // If the first word is short (≤4 chars) and looks like an acronym or short code, use it as-is
  if (words[0].length <= 4) return words[0].toUpperCase()

  // Otherwise take first letter of each word, max 5 chars
  return words.map(w => w[0]).join('').toUpperCase().slice(0, 5)
}

/* ─── Schema ─────────────────────────────────────────────────────────── */

const schema = z.object({
  suppliedTo:       z.string().min(1, 'Supplied to is required'),
  destinationCode:  z.string().min(1, 'Destination code is required').max(6, 'Max 6 characters').regex(/^[A-Z0-9]+$/, 'Uppercase letters and numbers only'),
  deliveryLocation: z.string().optional(),
  driverName:       z.string().min(1, 'Driver name is required'),
  carNumber:        z.string().optional(),
  date:             z.string().min(1, 'Date is required'),
  notes:            z.string().optional(),
})

type Fields = z.infer<typeof schema>

/* ─── Ref handle exposed to parent ───────────────────────────────────── */

export interface Step3Handle {
  validate: () => Promise<boolean>
}

/* ─── Component ──────────────────────────────────────────────────────── */

interface Props {
  details:  Details
  onChange: (d: Details) => void
}

export const StockOutStep3Details = forwardRef<Step3Handle, Props>(
  function StockOutStep3Details({ details, onChange }, ref) {

    const {
      register,
      trigger,
      setValue,
      formState: { errors },
      getValues,
    } = useForm<Fields>({
      resolver: zodResolver(schema) as Resolver<Fields>,
      defaultValues: {
        suppliedTo:       details.suppliedTo,
        destinationCode:  details.destinationCode,
        deliveryLocation: details.deliveryLocation,
        driverName:       details.driverName,
        carNumber:        details.carNumber,
        date:             details.date,
        notes:            details.notes,
      },
      mode: 'onBlur',
    })

    useImperativeHandle(ref, () => ({
      validate: async () => {
        const ok = await trigger()
        if (ok) onChange({ ...details, ...getValues() })
        return ok
      },
    }))

    const sync = (key: keyof Fields) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(key, e.target.value as any, { shouldValidate: true })
        onChange({ ...details, [key]: e.target.value })
      }

    /* When suppliedTo loses focus, auto-suggest destinationCode if still empty */
    const handleSuppliedToBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const val = e.target.value.trim()
      setValue('suppliedTo', val, { shouldValidate: true })
      onChange({ ...details, suppliedTo: val })
      if (!getValues('destinationCode')) {
        const suggested = suggestDestCode(val)
        setValue('destinationCode', suggested, { shouldValidate: true })
        onChange({ ...details, suppliedTo: val, destinationCode: suggested })
      }
    }

    return (
      <div className="card" style={{ padding: 24, maxWidth: 720 }}>
        <div className="t-h3" style={{ marginBottom: 16 }}>Movement details</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          <FormRow label="Supplied To" required span={2} error={errors.suppliedTo?.message}>
            <Input
              {...register('suppliedTo')}
              onBlur={handleSuppliedToBlur}
              onChange={sync('suppliedTo')}
              placeholder="e.g. TG Bank — Head Office"
            />
          </FormRow>

          <FormRow label="Location" hint="City or address of delivery">
            <Input
              {...register('deliveryLocation')}
              onChange={sync('deliveryLocation')}
              placeholder="e.g. Accra"
            />
          </FormRow>

          <FormRow
            label="Destination Code"
            required
            error={errors.destinationCode?.message}
            hint="Short code for waybill number — auto-suggested, you can edit"
          >
            <Input
              {...register('destinationCode')}
              onChange={e => {
                const upper = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                setValue('destinationCode', upper, { shouldValidate: true })
                onChange({ ...details, destinationCode: upper })
              }}
              placeholder="e.g. TGB"
              style={{ fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase' }}
              maxLength={6}
            />
          </FormRow>

          <FormRow label="Driver's Name" required error={errors.driverName?.message}>
            <Input
              {...register('driverName')}
              onChange={sync('driverName')}
              placeholder="e.g. Kojo Mensah"
            />
          </FormRow>

          <FormRow label="Car / Plate Number" hint="Vehicle registration number">
            <Input
              {...register('carNumber')}
              onChange={sync('carNumber')}
              placeholder="e.g. GR-1234-24"
            />
          </FormRow>

          <FormRow label="Date" required error={errors.date?.message}>
            <Input
              type="date"
              {...register('date')}
              onChange={sync('date')}
            />
          </FormRow>

          <FormRow label="Notes" span={2}>
            <Textarea
              {...register('notes')}
              onChange={sync('notes')}
              rows={3}
            />
          </FormRow>

        </div>
      </div>
    )
  }
)
