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
import { COMPANY_BY_ID, WAYBILLS } from '../../../lib/data'

function StockOutForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const tweaks       = useTweaksContext()
  const isStepper    = tweaks.stockOutFlow === 'stepper'
  const preItemId    = searchParams.get('item') ?? ''

  const [step, setStep]           = useState(1)
  const [companyId, setCompanyId] = useState('vsa')
  const [lines, setLines]         = useState<Line[]>(
    preItemId ? [{ itemId: preItemId, qty: 1, selectedSerials: [] }] : []
  )
  const [details, setDetails] = useState<Details>({
    suppliedTo: '', destinationCode: '', driverName: '', carNumber: '',
    date: '2026-05-22', notes: '',
  })

  const step3Ref = useRef<Step3Handle>(null)

  const company = COMPANY_BY_ID[companyId]
  const year    = new Date(details.date || Date.now()).getFullYear()
  const seq     = details.destinationCode
    ? WAYBILLS.filter(w =>
        w.companyId === companyId &&
        w.destinationCode === details.destinationCode &&
        new Date(w.date).getFullYear() === year
      ).length + 1
    : 0
  const waybillNum = company && details.destinationCode
    ? `${company.code}/${details.destinationCode}/${year}/${String(seq).padStart(2, '0')}`
    : '—'
  const totalUnits = lines.reduce((s, l) => s + l.qty, 0)

  const handleContinue = async () => {
    if (step === 3) {
      const valid = await step3Ref.current?.validate()
      if (!valid) return
    }
    setStep(s => s + 1)
  }

  const confirm = () => {
    toast.success(`Waybill ${waybillNum} generated`, {
      description: `${totalUnits} unit${totalUnits !== 1 ? 's' : ''} dispatched to ${details.suppliedTo || 'destination'}`,
    })
    setTimeout(() => router.push('/movements'), 1500)
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
          <StockOutStep1Company companyId={companyId} onSelect={setCompanyId} />
          <StockOutStep2Items   companyId={companyId} lines={lines}   onLines={setLines} />
          <StockOutStep3Details ref={step3Ref} details={details} onChange={setDetails} />
          <StockOutStep4Review  companyId={companyId} lines={lines}   details={details} />
          <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.push('/movements')}>
              Cancel
            </button>
            <Button onClick={confirm} disabled={lines.length === 0}
              style={{ background: 'var(--secondary)', color: '#fff' }}>
              Generate Waybill
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
        {step === 1 && <StockOutStep1Company companyId={companyId} onSelect={setCompanyId} />}
        {step === 2 && <StockOutStep2Items   companyId={companyId} lines={lines}   onLines={setLines} />}
        {step === 3 && <StockOutStep3Details ref={step3Ref} details={details} onChange={setDetails} />}
        {step === 4 && <StockOutStep4Review  companyId={companyId} lines={lines}   details={details} />}
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
          <Button onClick={confirm} style={{ background: 'var(--secondary)', color: '#fff' }}>
            Generate Waybill
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
