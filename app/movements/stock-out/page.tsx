'use client'
import { Loading } from '@/components/ui/Loading'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { AppShell, useTweaksContext } from '../../../components/layout/AppShell'
import { PageHeader }     from '../../../components/ui/PageHeader'
import { Icon }           from '../../../components/icons/Icon'
import { Button }         from '@/components/ui/button'
import { StepIndicator }         from '../../../components/movement/StepIndicator'
import { StockOutStep1Company }  from '../../../components/movement/StockOutStep1Company'
import { StockOutStep2Items }    from '../../../components/movement/StockOutStep2Items'
import { StockOutStep3Details, type Step3Handle } from '../../../components/movement/StockOutStep3Details'
import { StockOutStep4Review }   from '../../../components/movement/StockOutStep4Review'
import type { Line, Details }    from '../../../components/movement/stockout-types'
import { stockOut }              from '@/app/actions/movements'
import { listCompanies }         from '@/app/actions/settings'

function StockOutForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const tweaks       = useTweaksContext()
  const isStepper    = tweaks.stockOutFlow === 'stepper'
  const preItemId    = searchParams.get('item') ?? ''

  const [companies,   setCompanies]   = useState<{ id: string; name: string; code: string; tagline: string; waybillSequence: number }[]>([])
  const [step,        setStep]        = useState(1)
  const [companyId,   setCompanyId]   = useState('')
  const [lines,       setLines]       = useState<Line[]>([])
  const [details,     setDetails]     = useState<Details>({
    suppliedTo: '', destinationCode: '', driverName: '', carNumber: '',
    date: new Date().toISOString().slice(0, 10), notes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const step3Ref = useRef<Step3Handle>(null)

  useEffect(() => {
    listCompanies().then(cos => {
      setCompanies(cos.map(c => ({ id: c.id, name: c.name, code: c.code, tagline: c.tagline, waybillSequence: c.waybillSequence })))
      if (cos.length > 0) setCompanyId(cos[0].id)
    })
  }, [])

  // Pre-select item from query param once company is set
  useEffect(() => {
    if (preItemId && companyId && lines.length === 0) {
      setLines([{ itemId: preItemId, itemName: '', isSerialised: false, qty: 1, selectedSerials: [] }])
    }
  }, [preItemId, companyId])

  const company    = companies.find(c => c.id === companyId)
  const totalUnits = lines.reduce((s, l) => s + l.qty, 0)

  const handleCompanyChange = (id: string) => {
    setCompanyId(id)
    setLines([])
    setStep(isStepper ? 2 : 1)
  }

  const handleContinue = async () => {
    if (step === 3) {
      const valid = await step3Ref.current?.validate()
      if (!valid) return
    }
    setStep(s => s + 1)
  }

  const confirm = async () => {
    if (!companyId || lines.length === 0) return
    setSubmitting(true)
    try {
      const result = await stockOut({
        companyId,
        lines:           lines.map(l => ({ itemId: l.itemId, qty: l.qty, selectedSerials: l.selectedSerials, conditionFrom: l.conditionFrom })),
        suppliedTo:      details.suppliedTo,
        destinationCode: details.destinationCode,
        driverName:      details.driverName,
        notes:           details.notes || undefined,
        date:            details.date || undefined,
      })
      toast.success(`Waybill ${result.waybillNumber} generated`, {
        description: `${totalUnits} unit${totalUnits !== 1 ? 's' : ''} dispatched to ${details.suppliedTo}`,
      })
      router.push(`/waybills/${result.waybillId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Stock out failed')
    } finally {
      setSubmitting(false)
    }
  }

  const breadcrumb = (
    <>
      <span onClick={() => router.push('/movements')} style={{ cursor: 'pointer' }}>Movements</span>
      <Icon name="chevronRight" size={12} />
      Stock Out
    </>
  )

  /* ── Single-page variant ──────────────────────────────────────── */
  if (!isStepper) {
    return (
      <div>
        <PageHeader title="Record Stock Out" breadcrumb={breadcrumb}
          subtitle="Dispatch items and generate a waybill." />
        <div className="col gap-4">
          <StockOutStep1Company companyId={companyId} companies={companies} onSelect={handleCompanyChange} />
          <StockOutStep2Items lines={lines} onLines={setLines} />
          <StockOutStep3Details ref={step3Ref} details={details} onChange={setDetails} />
          <StockOutStep4Review  company={company ?? { name: '', code: '', waybillSequence: 0 }} lines={lines} details={details} />
          <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.push('/movements')}>
              Cancel
            </button>
            <Button onClick={confirm} disabled={lines.length === 0 || submitting}
              style={{ background: 'var(--secondary)', color: '#fff' }}>
              {submitting ? 'Generating…' : 'Generate Waybill'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Stepper variant ──────────────────────────────────────────── */
  return (
    <div>
      <PageHeader title="Record Stock Out" breadcrumb={breadcrumb}
        subtitle="Dispatch items and generate a waybill." />

      <StepIndicator step={step} />

      <div className="step-pane">
        {step === 1 && <StockOutStep1Company companyId={companyId} companies={companies} onSelect={handleCompanyChange} />}
        {step === 2 && <StockOutStep2Items lines={lines} onLines={setLines} />}
        {step === 3 && <StockOutStep3Details ref={step3Ref} details={details} onChange={setDetails} />}
        {step === 4 && <StockOutStep4Review  company={company ?? { name: '', code: '', waybillSequence: 0 }} lines={lines} details={details} />}
      </div>

      <div className="row" style={{ justifyContent: 'space-between', marginTop: 24 }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm row gap-2"
          onClick={() => step === 1 ? router.push('/movements') : setStep(s => s - 1)}
        >
          <Icon name="chevronLeft" size={14} />
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        <span className="muted" style={{ fontSize: 13 }}>
          Step {step} of 4{totalUnits > 0 ? ` · ${totalUnits} unit${totalUnits !== 1 ? 's' : ''}` : ''}
        </span>

        {step < 4 ? (
          <Button
            onClick={handleContinue}
            disabled={step === 2 && lines.length === 0}
            style={{ background: 'var(--secondary)', color: '#fff' }}
          >
            Continue <Icon name="chevronRight" size={14} />
          </Button>
        ) : (
          <Button onClick={confirm} disabled={submitting} style={{ background: 'var(--secondary)', color: '#fff' }}>
            {submitting ? 'Generating…' : 'Generate Waybill'}
          </Button>
        )}
      </div>
    </div>
  )
}

export default function StockOutPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('auth_user')
    if (!stored) { router.push('/login'); return }
    setUser(JSON.parse(stored))
  }, [router])

  if (!user) return <Loading />

  return (
    <AppShell user={user} onLogout={() => { localStorage.removeItem('auth_user'); router.push('/login') }}>
      <Suspense>
        <StockOutForm />
      </Suspense>
    </AppShell>
  )
}
