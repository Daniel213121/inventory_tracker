'use client'

import { useEffect, useState }          from 'react'
import { useParams, useRouter }         from 'next/navigation'
import { AppShell }                     from '../../../components/layout/AppShell'
import { PageHeader }                   from '../../../components/ui/PageHeader'
import { SectionTitle }                 from '../../../components/ui/SectionTitle'
import { EmptyState }                   from '../../../components/ui/EmptyState'
import { Lettermark }                   from '../../../components/ui/Lettermark'
import { Loading }                      from '@/components/ui/Loading'
import { Icon }                         from '../../../components/icons/Icon'
import { Button }                       from '@/components/ui/button'
import { fmtDate }                      from '../../../lib/utils'
import { getWaybill, logWaybillPrint }  from '@/app/actions/waybills'

// ─── Types ────────────────────────────────────────────────────────────────────

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
  logoUrl:               string | null
}

type WaybillDetail = {
  id:               string
  number:           string
  companyId:        string
  date:             string
  suppliedTo:       string
  destinationCode:  string
  deliveryLocation: string | null
  driverName:       string
  carNumber:        string | null
  generatedBy:      string
  generatedAt:      string
  company:          WaybillCompany | null
  lines:            WaybillLine[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="t-label" style={{ fontSize: 11, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14 }}>{children}</div>
    </div>
  )
}

function ordinalDate(dateStr: string): React.ReactNode {
  const d      = new Date(dateStr)
  const day    = d.getDate()
  const suffix = [11, 12, 13].includes(day) ? 'th'
    : day % 10 === 1 ? 'st'
    : day % 10 === 2 ? 'nd'
    : day % 10 === 3 ? 'rd'
    : 'th'
  const month = d.toLocaleString('en-GB', { month: 'long' })
  return <>{day}<sup style={{ fontSize: '0.65em' }}>{suffix}</sup> {month} {d.getFullYear()}</>
}

const LINE_MIN = 8

function blankRows(count: number) {
  return Array.from({ length: count }, (_, i) => (
    <tr key={`blank-${i}`}>
      <td style={{ border: '1px solid #ccc', padding: '8px 6px', height: 28 }}>&nbsp;</td>
      <td style={{ border: '1px solid #ccc', padding: '8px 6px' }}>&nbsp;</td>
      <td style={{ border: '1px solid #ccc', padding: '8px 6px' }}>&nbsp;</td>
    </tr>
  ))
}

function ItemsTable({ lines, padRows }: { lines: WaybillLine[]; padRows: number }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0 32px' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ccc', padding: '7px 6px', width: 52, textAlign: 'center', fontWeight: 700, fontSize: 12 }}>NO.</th>
          <th style={{ border: '1px solid #ccc', padding: '7px 6px', textAlign: 'center', fontWeight: 700, fontSize: 12 }}>DESCRIPTION</th>
          <th style={{ border: '1px solid #ccc', padding: '7px 6px', width: 72, textAlign: 'center', fontWeight: 700, fontSize: 12 }}>QTY</th>
        </tr>
      </thead>
      <tbody>
        {lines.map((line, i) => (
          <tr key={line.id}>
            <td style={{ border: '1px solid #ccc', padding: '8px 6px', textAlign: 'center' }}>{i + 1}</td>
            <td style={{ border: '1px solid #ccc', padding: '8px 6px' }}>
              <div>{line.name}{line.brand || line.model ? ` (${[line.brand, line.model].filter(Boolean).join(' ')})` : ''}</div>
              {line.serialsDispatched.length > 0 && (
                <div style={{ color: '#555', fontSize: 11 }}>S/N: {line.serialsDispatched.join(', ')}</div>
              )}
            </td>
            <td style={{ border: '1px solid #ccc', padding: '8px 6px', textAlign: 'center' }}>{line.qty} pc</td>
          </tr>
        ))}
        {blankRows(padRows)}
      </tbody>
    </table>
  )
}

function CompanyLogo({ company, height = 120 }: { company: WaybillCompany; height?: number }) {
  if (company.logoUrl) {
    return (
      <img
        src={company.logoUrl}
        alt={company.code}
        style={{ height, width: 'auto', objectFit: 'contain' }}
      />
    )
  }
  return <div style={{ fontSize: 36, fontWeight: 800, color: '#1E3A5F' }}>{company.code}</div>
}

function SignatureBlock({ company, waybill }: { company: WaybillCompany; waybill: WaybillDetail }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
      <div>
        <div style={{ borderBottom: '1px dotted #555', marginBottom: 8, height: 32 }} />
        <div style={{ fontSize: 12 }}>FOR: {company.fullName.toUpperCase()}</div>
        <div style={{ fontSize: 12 }}>{company.authoriserName}</div>
        <div style={{ fontSize: 12 }}>DESIGNATION: {company.authoriserDesignation}</div>
      </div>
      <div>
        <div style={{ borderBottom: '1px dotted #555', marginBottom: 8, height: 32 }} />
        <div style={{ fontSize: 12 }}>FOR: {waybill.suppliedTo}</div>
        <div style={{ fontSize: 12 }}>NAME:</div>
        <div style={{ fontSize: 12 }}>DESIGNATION:</div>
      </div>
    </div>
  )
}

// ─── VIA Layout ───────────────────────────────────────────────────────────────

function VIAWaybillBody({ waybill, company, lines }: {
  waybill: WaybillDetail
  company: WaybillCompany
  lines:   WaybillLine[]
}) {
  const padRows = Math.max(0, LINE_MIN - lines.length)

  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", color: '#111', fontSize: 13 }}>

      {/* Header — address/contact left, logo right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, minHeight: 90 }}>
        <div style={{ fontSize: 11, color: '#333', lineHeight: 2 }}>
          <div>{company.addressGhana}</div>
          <div>TEL: {[company.phoneGhana, company.mobileGhana].filter(Boolean).join(' / ')}&nbsp;&nbsp;|&nbsp;&nbsp;EMAIL: {company.email}</div>
        </div>
        <div style={{ flexShrink: 0, marginLeft: 32 }}>
          <CompanyLogo company={company} />
        </div>
      </div>

      {/* Title */}
      <h1 style={{ textAlign: 'center', fontSize: 46, fontWeight: 900, letterSpacing: '0.04em', margin: '0 0 20px' }}>
        WAYBILL
      </h1>

      {/* Date + Number */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13 }}>
        <div><strong>DATE:&nbsp;</strong>{ordinalDate(waybill.date)}</div>
        <div><strong>WAYBILL NO.:&nbsp;</strong>{waybill.number}</div>
      </div>

      {/* Supplied to + Driver */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 6 }}>
        <div>
          <div style={{ textDecoration: 'underline', fontWeight: 600, marginBottom: 4 }}>SUPPLIED TO:</div>
          <div>{waybill.suppliedTo}</div>
          {waybill.deliveryLocation && (
            <div style={{ textTransform: 'uppercase' }}>{waybill.deliveryLocation}</div>
          )}
        </div>
        <div>
          <div style={{ marginBottom: 4 }}><strong>DRIVER:&nbsp;</strong>{waybill.driverName}</div>
          <div style={{ marginTop: 8 }}>
            <strong>CAR NUMBER:&nbsp;</strong>
            <span style={{ borderBottom: '1px solid #333', display: 'inline-block', minWidth: 100 }}>
              {waybill.carNumber ? ` ${waybill.carNumber}` : ' '}
            </span>
          </div>
        </div>
      </div>

      <ItemsTable lines={lines} padRows={padRows} />

      <div style={{ marginBottom: 24, height: 56 }} />

      <SignatureBlock company={company} waybill={waybill} />

      {/* Blue rule + footer */}
      <div style={{ borderTop: '3px solid #0EA5E9', marginTop: 28 }} />
      <div style={{ textAlign: 'center', fontSize: 11, color: '#333', marginTop: 10, lineHeight: 1.8 }}>
        <div style={{ fontWeight: 600 }}>{company.fullName}</div>
        <div>{company.addressGhana}&nbsp;&nbsp;|&nbsp;&nbsp;Tel: {[company.phoneGhana, company.mobileGhana].filter(Boolean).join(' / ')}</div>
        <div>Email: {company.email}&nbsp;&nbsp;|&nbsp;&nbsp;{company.website}</div>
      </div>
    </div>
  )
}

// ─── VSA Layout ───────────────────────────────────────────────────────────────

function VSAWaybillBody({ waybill, company, lines }: {
  waybill: WaybillDetail
  company: WaybillCompany
  lines:   WaybillLine[]
}) {
  const padRows = Math.max(0, LINE_MIN - lines.length)

  return (
    <div style={{ fontFamily: "'Inter', Arial, sans-serif", color: '#111', fontSize: 13 }}>

      {/* Header — tagline left, logo right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, minHeight: 90 }}>
        <div style={{ fontSize: 11, color: '#333', lineHeight: 2 }}>
          {company.tagline}{company.taglineLine2 ? ` | ${company.taglineLine2}` : ''}
        </div>
        <div style={{ flexShrink: 0, marginLeft: 32 }}>
          <CompanyLogo company={company} />
        </div>
      </div>

      {/* Title */}
      <h1 style={{ textAlign: 'center', fontSize: 46, fontWeight: 900, letterSpacing: '0.04em', margin: '0 0 20px' }}>
        WAYBILL
      </h1>

      {/* Date + Number */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13 }}>
        <div><strong>DATE:&nbsp;</strong>{ordinalDate(waybill.date)}</div>
        <div><strong>WAYBILL NO.:&nbsp;</strong>{waybill.number}</div>
      </div>

      {/* Supplied to + Driver */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 6 }}>
        <div>
          <div style={{ textDecoration: 'underline', fontWeight: 600, marginBottom: 4 }}>SUPPLIED TO:</div>
          <div>{waybill.suppliedTo}</div>
          {waybill.deliveryLocation && (
            <div style={{ textTransform: 'uppercase' }}>{waybill.deliveryLocation}</div>
          )}
        </div>
        <div>
          <div style={{ marginBottom: 4 }}><strong>DRIVER:&nbsp;</strong>{waybill.driverName}</div>
          <div style={{ marginTop: 8 }}>
            <strong>CAR NUMBER:&nbsp;</strong>
            <span style={{ borderBottom: '1px solid #333', display: 'inline-block', minWidth: 120 }}>
              {waybill.carNumber ? ` ${waybill.carNumber}` : ' '}
            </span>
          </div>
        </div>
      </div>

      <ItemsTable lines={lines} padRows={padRows} />

      <div style={{ marginBottom: 24, height: 56 }} />

      <SignatureBlock company={company} waybill={waybill} />

      {/* Gold rule + footer */}
      <div style={{ borderTop: '2px solid #D4A017', marginTop: 28 }} />
      <div style={{ textAlign: 'center', fontSize: 10, color: '#333', marginTop: 10, lineHeight: 1.8 }}>
        <div style={{ fontWeight: 600, fontSize: 11 }}>{company.fullName}</div>
        <div>Ghana: {company.addressGhana}&nbsp;&nbsp;|&nbsp;&nbsp;Telephone: {company.phoneGhana}&nbsp;&nbsp;Mobile: {company.mobileGhana}</div>
        <div>U.S.A: {company.addressUSA}&nbsp;&nbsp;|&nbsp;&nbsp;Telephone: {company.phoneUSA}</div>
        <div>Email: {company.email}&nbsp;&nbsp;|&nbsp;&nbsp;Website: {company.website}</div>
      </div>
    </div>
  )
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

function WaybillBody({ waybill, company, lines }: {
  waybill: WaybillDetail
  company: WaybillCompany
  lines:   WaybillLine[]
}) {
  if (company.code === 'VSA') {
    return <VSAWaybillBody waybill={waybill} company={company} lines={lines} />
  }
  return <VIAWaybillBody waybill={waybill} company={company} lines={lines} />
}

// ─── Detail view ──────────────────────────────────────────────────────────────

function WaybillDetailView({ id }: { id: string }) {
  const router = useRouter()

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
          <button className="btn btn-secondary btn-sm row gap-2" onClick={handlePrint}>
            <Icon name="print" size={15} /> Print
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'flex-start' }}>

        {/* Paper preview */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            className="paper waybill-doc"
            style={{ width: 794, minHeight: 1123, padding: '40px 64px 60px', boxSizing: 'border-box' }}
          >
            <WaybillBody waybill={waybill} company={company} lines={lines} />
          </div>
        </div>

        {/* Sidebar */}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

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
