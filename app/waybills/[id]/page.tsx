'use client'

import { useEffect, useState }          from 'react'
import { useParams, useRouter }         from 'next/navigation'
import { AppShell, useTweaksContext }   from '../../../components/layout/AppShell'
import { PageHeader }                   from '../../../components/ui/PageHeader'
import { SectionTitle }                 from '../../../components/ui/SectionTitle'
import { EmptyState }                   from '../../../components/ui/EmptyState'
import { Lettermark }                   from '../../../components/ui/Lettermark'
import { Loading }                      from '@/components/ui/Loading'
import { Icon }                         from '../../../components/icons/Icon'
import { Button }                       from '@/components/ui/button'
import { fmtDate }                      from '../../../lib/utils'
import { getWaybill, logWaybillPrint }  from '@/app/actions/waybills'
import type { TweakWaybillLayout }      from '../../../lib/types'

type WaybillLine = {
  id:                string
  qty:               number
  name:              string
  brand:             string
  model:             string
  serialsDispatched: string[]
}

type WaybillCompany = {
  id:                    string
  name:                  string
  code:                  string
  tagline:               string
  taglineLine2:          string
  fullName:              string
  addressGhana:          string
  addressUSA:            string
  phoneGhana:            string
  mobileGhana:           string
  phoneUSA:              string
  email:                 string
  website:               string
  brandSubtitle:         string
  authoriserName:        string
  authoriserDesignation: string
}

type WaybillDetail = {
  id:              string
  number:          string
  companyId:       string
  date:            string
  suppliedTo:      string
  destinationCode: string
  driverName:      string
  generatedBy:     string
  generatedAt:     string
  company:         WaybillCompany | null
  lines:           WaybillLine[]
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="t-label" style={{ fontSize: 11, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14 }}>{children}</div>
    </div>
  )
}

function ordinalDate(dateStr: string): string {
  const d      = new Date(dateStr)
  const day    = d.getDate()
  const suffix = [11, 12, 13].includes(day) ? 'TH'
    : day % 10 === 1 ? 'ST'
    : day % 10 === 2 ? 'ND'
    : day % 10 === 3 ? 'RD'
    : 'TH'
  const month = d.toLocaleString('en-GB', { month: 'long' }).toUpperCase()
  return `${day}${suffix} ${month} ${d.getFullYear()}`
}

function Logo({ company, accent }: { company: WaybillCompany; accent: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={62} height={46} viewBox="0 0 62 46">
        <path d="M2,2 L16,2 L28,23 L16,44 L2,44 L12,23 Z" fill="#5A2F8E" />
        <path d="M20,2 L34,2 L46,23 L34,44 L20,44 L30,23 Z" fill="#E89A2B" />
        <path d="M38,2 L52,2 L62,23 L52,44 L38,44 L48,23 Z" fill="#5A2F8E" />
      </svg>
      <div>
        <div style={{ fontSize: 38, fontWeight: 800, color: '#5A2F8E', lineHeight: 1 }}>
          {company.code}
        </div>
        <div style={{ height: 2, background: accent, margin: '4px 0' }} />
        <div style={{ fontSize: 10.5, color: '#333' }}>{company.name}</div>
        <div style={{ fontSize: 10, fontStyle: 'italic', color: '#666' }}>{company.brandSubtitle}</div>
      </div>
    </div>
  )
}

function WaybillBody({
  waybill,
  company,
  lines,
  layout,
}: {
  waybill: WaybillDetail
  company: WaybillCompany
  lines:   WaybillLine[]
  layout:  TweakWaybillLayout
}) {
  const accent   = company.code === 'VSA' ? '#D4A017' : '#0EA5E9'
  const totalQty = lines.reduce((s, l) => s + l.qty, 0)

  if (layout !== 'modern') {
    return (
      <div style={{ color: '#999', fontSize: 13, padding: 40, textAlign: 'center' }}>
        Layout &ldquo;{layout}&rdquo; — TODO
      </div>
    )
  }

  return (
    <>
      {/* Top row: tagline left, logo right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1, textAlign: 'center', color: '#3F2B70', fontSize: 11.5, lineHeight: 1.75 }}>
          {company.tagline}
          <br />
          {company.taglineLine2}
        </div>
        <Logo company={company} accent={accent} />
      </div>

      {/* Title */}
      <h1 style={{ textAlign: 'center', fontSize: 44, fontWeight: 700, margin: '12px 0 18px', letterSpacing: '0.02em' }}>
        WAYBILL
      </h1>

      {/* Date + Number */}
      <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, marginBottom: 28 }}>
        DATE: {ordinalDate(waybill.date)}&nbsp;&nbsp;&nbsp;&nbsp;WAYBILL NO: {waybill.number}
      </div>

      {/* Destination block */}
      <div style={{ borderTop: `2px solid ${accent}`, borderBottom: `2px solid ${accent}`, padding: '12px 0', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 32 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888' }}>
              Supplied To
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{waybill.suppliedTo}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888' }}>
              Waybill No
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>{waybill.number}</div>
          </div>
        </div>
      </div>

      {/* Items table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr>
            {['QTY', 'DESCRIPTION', 'REMARKS'].map(col => (
              <th key={col} style={{
                borderBottom: `2px solid ${accent}`, fontSize: 11, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                padding: '4px 8px', textAlign: 'left',
              }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lines.map((line, i) => (
            <tr key={i}>
              <td style={{ padding: '6px 8px', borderBottom: '1px solid #eee', width: 48 }}>{line.qty}</td>
              <td style={{ padding: '6px 8px', borderBottom: '1px solid #eee' }}>
                {line.name} ({line.brand} {line.model})
                {line.serialsDispatched.length > 0 && (
                  <span style={{ color: '#555', fontSize: 11 }}> — SN: {line.serialsDispatched.join(', ')}</span>
                )}
              </td>
              <td style={{ padding: '6px 8px', borderBottom: '1px solid #eee' }}></td>
            </tr>
          ))}
          <tr>
            <td style={{ padding: '6px 8px', fontWeight: 600 }}>{totalQty}</td>
            <td style={{ padding: '6px 8px' }}>—</td>
            <td style={{ padding: '6px 8px' }}>All items as listed</td>
          </tr>
        </tbody>
      </table>

      {/* Signatures */}
      <div style={{ marginTop: 40, borderTop: '1px solid #ccc', paddingTop: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32 }}>
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#888', letterSpacing: '0.05em' }}>Supplied by</div>
            <div style={{ borderBottom: '1px solid #999', marginTop: 40 }} />
            <div style={{ fontSize: 12, marginTop: 6 }}>{company.authoriserName}</div>
            <div style={{ fontSize: 11, color: '#888' }}>{company.authoriserDesignation}</div>
            <div style={{ fontSize: 11, color: '#888' }}>{company.code}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#888', letterSpacing: '0.05em' }}>Received by</div>
            <div style={{ borderBottom: '1px solid #999', marginTop: 40 }} />
            <div style={{ fontSize: 12, marginTop: 6, color: '#888' }}>{waybill.driverName}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', color: '#888', letterSpacing: '0.05em' }}>Authorized by</div>
            <div style={{ borderBottom: '1px solid #999', marginTop: 40 }} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #eee', fontSize: 10, color: '#555', textAlign: 'center' }}>
        <div>{company.fullName}&nbsp;|&nbsp;{company.addressGhana}&nbsp;|&nbsp;{company.addressUSA}</div>
        <div>{company.phoneGhana} / {company.mobileGhana}&nbsp;|&nbsp;{company.phoneUSA}&nbsp;|&nbsp;{company.email}&nbsp;|&nbsp;{company.website}</div>
      </div>
    </>
  )
}

function WaybillDetailView({ id }: { id: string }) {
  const router = useRouter()
  const tweaks = useTweaksContext()
  const layout = tweaks.waybillLayout ?? 'modern'

  const [waybill, setWaybill] = useState<WaybillDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWaybill(id).then(w => {
      setWaybill(w as WaybillDetail | null)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><Loading /></div>
  }

  if (!waybill || !waybill.company) {
    return <EmptyState icon="package" title="Waybill not found" message="This waybill doesn't exist." />
  }

  const { company, lines } = waybill

  const handlePrint = async () => {
    await logWaybillPrint(waybill.id)
    window.print()
  }

  return (
    <div>
      <PageHeader
        title={`Waybill ${waybill.number}`}
        breadcrumb={
          <>
            <span onClick={() => router.push('/waybills')} style={{ cursor: 'pointer' }}>Waybills</span>
            <Icon name="chevronRight" size={12} />
            <span className="t-mono">{waybill.number}</span>
          </>
        }
        actions={
          <>
            <button className="btn btn-secondary btn-sm row gap-2" onClick={handlePrint}>
              <Icon name="print" size={15} /> Print
            </button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'flex-start' }}>
        {/* Left: paper preview */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            className="paper waybill-doc"
            data-layout={layout}
            style={{ width: 800, padding: 56, fontFamily: "'Inter', sans-serif", color: '#111', position: 'relative' }}
          >
            <WaybillBody waybill={waybill} company={company} lines={lines} layout={layout} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="col gap-4">
          <div className="card" style={{ padding: 20 }}>
            <SectionTitle>Waybill info</SectionTitle>
            <div className="col gap-3" style={{ marginTop: 16 }}>
              <KV label="Waybill No.">
                <span className="t-mono" style={{ fontWeight: 600 }}>{waybill.number}</span>
              </KV>
              <KV label="Company">
                <div className="row gap-2" style={{ alignItems: 'center' }}>
                  <Lettermark company={company} size={20} />
                  <span>{company.name}</span>
                </div>
              </KV>
              <KV label="Date">{fmtDate(waybill.date)}</KV>
              <KV label="Supplied To">{waybill.suppliedTo}</KV>
              <KV label="Driver">{waybill.driverName}</KV>
              <KV label="Generated">{fmtDate(waybill.generatedAt)} by {waybill.generatedBy}</KV>
              <KV label="Lines">{lines.length} item{lines.length !== 1 ? 's' : ''}</KV>
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <SectionTitle>Actions</SectionTitle>
            <div className="col gap-2" style={{ marginTop: 12 }}>
              <Button variant="outline" style={{ justifyContent: 'flex-start', gap: 8 }} onClick={handlePrint}>
                <Icon name="print" size={15} /> Print preview
              </Button>
              <Button
                variant="outline"
                style={{ justifyContent: 'flex-start', gap: 8 }}
                onClick={() => router.push('/movements')}
              >
                <Icon name="external" size={15} /> View linked movements
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WaybillDetailPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('auth_user')
    if (!stored) { router.push('/login'); return }
    setUser(JSON.parse(stored))
  }, [router])

  if (!user) return <Loading />

  return (
    <AppShell user={user} onLogout={() => { localStorage.removeItem('auth_user'); router.push('/login') }}>
      <WaybillDetailView id={id} />
    </AppShell>
  )
}
