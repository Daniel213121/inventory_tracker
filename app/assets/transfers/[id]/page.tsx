'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AppShell }     from '../../../../components/layout/AppShell'
import { PageHeader }   from '../../../../components/ui/PageHeader'
import { SectionTitle } from '../../../../components/ui/SectionTitle'
import { KindBadge }    from '../../../../components/ui/badges'
import { Icon }         from '../../../../components/icons/Icon'
import { Loading }      from '../../../../components/ui/Loading'
import { fmtDate, fmtWaybillDate } from '../../../../lib/utils'
import {
  ASSET_TRANSFERS, ASSET_TRANSFER_BY_ID,
  ASSET_BY_ID, BRANCH_BY_ID, EMPLOYEE_BY_ID,
  COMPANY_BY_ID, USERS,
  ASSET_TYPE_LABEL, ASSET_CONDITION_LABEL,
  TRANSFER_REASON_LABEL,
  fmtCurrency,
} from '../../../../lib/data'
import type { TransferReason } from '../../../../lib/types'

// ─── Logo ─────────────────────────────────────────────────────────────────

function DocLogo({ company }: { company: { code: string; name: string; brandSubtitle: string } }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={62} height={46} viewBox="0 0 62 46" fill="none">
        <path d="M2 2 L20 23 L2 44" stroke="#E89A2B" strokeWidth={4.5}
          strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 2 L34 23 L16 44" stroke="#E89A2B" strokeWidth={4.5}
          strokeLinecap="round" strokeLinejoin="round" />
        <path d="M30 2 L48 23 L30 44" stroke="#5A2F8E" strokeWidth={4.5}
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ lineHeight: 1.05 }}>
        <div style={{ fontWeight: 800, fontSize: 38, color: '#5A2F8E', letterSpacing: '-0.01em' }}>
          {company.code}
        </div>
        <div style={{
          borderTop: '1.5px solid #D4A017', marginTop: 2, paddingTop: 3,
          color: '#5A2F8E', fontSize: 10.5, fontWeight: 600,
        }}>
          {company.name}
        </div>
        <div style={{
          color: '#5A2F8E', fontSize: 8.5, fontStyle: 'italic',
          marginTop: 1, textAlign: 'right',
        }}>
          {company.brandSubtitle}
        </div>
      </div>
    </div>
  )
}

// ─── Document ─────────────────────────────────────────────────────────────

interface DocProps {
  transferId: string
}

function ChangeOfAssetDoc({ transferId }: DocProps) {
  const transfer = ASSET_TRANSFER_BY_ID[transferId] ?? ASSET_TRANSFERS[0]
  const asset    = ASSET_BY_ID[transfer.assetId]
  const company  = COMPANY_BY_ID[transfer.companyId]
  const fromEmp  = transfer.fromEmployeeId ? EMPLOYEE_BY_ID[transfer.fromEmployeeId] : null
  const toEmp    = transfer.toEmployeeId   ? EMPLOYEE_BY_ID[transfer.toEmployeeId]   : null

  const accent = company?.id === 'vsa' ? '#D4A017' : '#0EA5E9'
  const purple = '#5A2F8E'

  function sectionLabel(text: string) {
    return (
      <div style={{ marginTop: 22, marginBottom: 10, borderBottom: `2px solid ${accent}`, paddingBottom: 4 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: purple,
        }}>{text}</div>
      </div>
    )
  }

  function docKV(label: string, value: string | undefined | null, mono?: boolean) {
    return (
      <div style={{ marginBottom: 6 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, color: '#374151',
          textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: 6,
        }}>{label}:</span>
        <span style={{
          fontSize: 12, fontWeight: 500, color: '#111',
          fontFamily: mono ? "'JetBrains Mono', monospace" : undefined,
        }}>{value || '—'}</span>
      </div>
    )
  }

  const specs = [asset?.processor, asset?.ram, asset?.storage, asset?.operatingSystem].filter(Boolean)

  return (
    <div className="paper" style={{
      width: 794, minHeight: 1123, padding: 56,
      fontFamily: "'Inter', sans-serif", color: '#111', position: 'relative',
    }}>
      {/* 1. Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, gap: 16 }}>
        <div style={{ flex: 1, color: '#3F2B70', fontSize: 11, lineHeight: 1.7 }}>
          <div>{company?.tagline}</div>
          <div>{company?.taglineLine2}</div>
        </div>
        {company && <DocLogo company={company} />}
      </div>

      {/* 2. Title */}
      <div style={{
        textAlign: 'center', fontSize: 30, fontWeight: 700,
        margin: '8px 0 16px', letterSpacing: '0.02em', color: '#111',
      }}>
        CHANGE OF ASSET MANAGEMENT
      </div>

      {/* 3. Ref + Date */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 40,
        marginBottom: 12, fontSize: 13, fontWeight: 700,
      }}>
        <span>
          REF:&nbsp;
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--secondary)' }}>
            {transfer.referenceNumber}
          </span>
        </span>
        <span>DATE: {fmtWaybillDate(transfer.generatedAt)}</span>
      </div>

      {/* 4. Asset details */}
      {sectionLabel('Asset Details')}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 32, rowGap: 0 }}>
        {docKV('Asset Tag', asset?.assetTag, true)}
        {docKV('Type', asset ? ASSET_TYPE_LABEL[asset.type] : undefined)}
        {docKV('Brand / Model', asset ? `${asset.brand} ${asset.model}` : undefined)}
        {docKV('Serial Number', asset?.serial, true)}
        {docKV('Condition at transfer',
          transfer.fromCondition
            ? ASSET_CONDITION_LABEL[transfer.fromCondition]
            : asset ? ASSET_CONDITION_LABEL[asset.condition] : undefined)}
        {docKV('Purchase Date', asset?.purchaseDate ? fmtDate(asset.purchaseDate) : undefined)}
      </div>

      {specs.length > 0 && (
        <div style={{
          marginTop: 10, padding: '10px 12px',
          background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 4,
          fontSize: 11.5, lineHeight: 1.6,
        }}>
          <span style={{ fontWeight: 600, color: purple, marginRight: 6 }}>SPECS:</span>
          {specs.join(' · ')}
        </div>
      )}

      {asset?.software && asset.software.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 11.5 }}>
          <span style={{ fontWeight: 600, color: purple, marginRight: 6 }}>SOFTWARE INSTALLED:</span>
          {asset.software.join(', ')}
        </div>
      )}

      {/* 5. Previous holder */}
      {sectionLabel('Previous Holder')}
      {fromEmp ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 32 }}>
            {docKV('Name', fromEmp.name)}
            {docKV('Job Title', fromEmp.jobTitle)}
            {docKV('Department', fromEmp.department)}
            {docKV('Employee ID', fromEmp.employeeId, true)}
            {docKV('Company', company?.fullName)}
            {docKV('Branch', BRANCH_BY_ID[fromEmp.branchId]?.name)}
          </div>
          <div style={{ marginTop: 8 }}>
            {docKV('Reason for transfer', TRANSFER_REASON_LABEL[transfer.reason as TransferReason])}
            {transfer.reasonNotes && (
              <div style={{
                marginTop: 4, padding: '8px 12px',
                background: '#fefce8', border: '1px solid #fde68a',
                borderRadius: 4, fontSize: 11.5, lineHeight: 1.6,
              }}>
                {transfer.reasonNotes}
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: 8 }}>
            {docKV('Date returned', transfer.returnedAt ? fmtDate(transfer.returnedAt) : undefined)}
            {docKV('Condition returned',
              transfer.fromCondition ? ASSET_CONDITION_LABEL[transfer.fromCondition] : undefined)}
          </div>
        </>
      ) : (
        <div style={{ fontSize: 12, fontStyle: 'italic', color: '#6b7280' }}>
          No previous holder — asset was in store before this change.
        </div>
      )}

      {/* 6. New holder */}
      {sectionLabel('New Holder')}
      {toEmp ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 32 }}>
            {docKV('Name', toEmp.name)}
            {docKV('Job Title', toEmp.jobTitle)}
            {docKV('Department', toEmp.department)}
            {docKV('Employee ID', toEmp.employeeId, true)}
            {docKV('Company', COMPANY_BY_ID[toEmp.companyId]?.fullName)}
            {docKV('Branch', BRANCH_BY_ID[toEmp.branchId]?.name)}
          </div>
          <div style={{ marginTop: 8 }}>
            {docKV('Date assigned', transfer.assignedAt ? fmtDate(transfer.assignedAt) : undefined)}
          </div>
        </>
      ) : (
        <div style={{ fontSize: 12, fontStyle: 'italic', color: '#6b7280' }}>
          {transfer.reason === 'BEYOND_REPAIR'
            ? 'Asset retired — no replacement issued.'
            : 'Asset returned to store — available for reassignment.'}
        </div>
      )}

      {/* 7. Authorisation */}
      {(() => {
        const processedByUser = USERS.find(u => u.id === transfer.processedBy)
        const sigBlocks = [
          { label: 'Processed by', name: processedByUser?.name ?? '—', role: 'IT Staff' },
          { label: 'Previous holder', name: fromEmp?.name ?? '—', role: fromEmp?.jobTitle ?? '' },
          { label: 'Authorised by', name: transfer.authorisedBy, role: 'Manager' },
        ]
        return (
          <div style={{
            marginTop: 40, display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr', gap: 32,
          }}>
            {sigBlocks.map(b => (
              <div key={b.label} style={{ borderTop: '1px dotted #111', paddingTop: 6 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: purple,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>{b.label}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 4 }}>{b.name.toUpperCase()}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{b.role}</div>
                <div style={{ marginTop: 14, fontSize: 11, color: '#374151' }}>
                  Date:{' '}
                  <span style={{
                    display: 'inline-block', borderBottom: '1px solid #9ca3af',
                    minWidth: 110, height: 14,
                  }} />
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: '#374151' }}>
                  Signature:{' '}
                  <span style={{
                    display: 'inline-block', borderBottom: '1px solid #9ca3af',
                    minWidth: 130, height: 14,
                  }} />
                </div>
              </div>
            ))}
          </div>
        )
      })()}

      {/* 8. Footer */}
      <div style={{
        borderTop: `2px solid ${accent}`, paddingTop: 8, marginTop: 36,
        textAlign: 'center', fontSize: 10, lineHeight: 1.55, color: '#111',
      }}>
        <div style={{ fontWeight: 700, fontStyle: 'italic', fontSize: 11.5, marginBottom: 4, color: purple }}>
          {company?.fullName}
        </div>
        <div>
          <strong style={{ color: accent }}>Ghana:</strong> {company?.addressGhana}
          <span style={{ margin: '0 8px', color: '#6b7280' }}>|</span>
          <strong style={{ color: accent }}>Tel:</strong> {company?.phoneGhana}
          <strong style={{ color: accent, marginLeft: 8 }}>Mobile:</strong> {company?.mobileGhana}
        </div>
        <div>
          <strong style={{ color: accent }}>Email:</strong> {company?.email}
          <span style={{ margin: '0 8px', color: '#6b7280' }}>|</span>
          <strong style={{ color: accent }}>Web:</strong> {company?.website}
        </div>
      </div>
    </div>
  )
}

// ─── Content ──────────────────────────────────────────────────────────────

function TransferDocContent({ id }: { id: string }) {
  const router   = useRouter()
  const transfer = ASSET_TRANSFER_BY_ID[id] ?? ASSET_TRANSFERS[0]
  const asset    = ASSET_BY_ID[transfer.assetId]
  const company  = COMPANY_BY_ID[transfer.companyId]
  const fromEmp  = transfer.fromEmployeeId ? EMPLOYEE_BY_ID[transfer.fromEmployeeId] : null
  const toEmp    = transfer.toEmployeeId   ? EMPLOYEE_BY_ID[transfer.toEmployeeId]   : null
  const processedByUser = USERS.find(u => u.id === transfer.processedBy)

  return (
    <div>
      <PageHeader
        title={`Change of Asset — ${transfer.referenceNumber}`}
        breadcrumb={
          <>
            <button className="btn btn-ghost btn-sm" style={{ padding: 0 }}
              onClick={() => router.push('/assets')}>Assets</button>
            <Icon name="chevronRight" size={14} stroke="var(--text-2)" />
            <button className="btn btn-ghost btn-sm" style={{ padding: 0 }}
              onClick={() => router.push(`/assets/${asset?.id}`)}>
              <span className="t-mono">{asset?.assetTag}</span>
            </button>
            <Icon name="chevronRight" size={14} stroke="var(--text-2)" />
            <span className="t-mono">{transfer.referenceNumber}</span>
          </>
        }
        actions={
          <>
            <button className="btn btn-secondary btn-sm row gap-2" onClick={() => window.print()}>
              <Icon name="print" size={14} />Print
            </button>
            <button className="btn btn-primary btn-sm row gap-2">
              <Icon name="download" size={14} />Download PDF
            </button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'flex-start' }}>

        {/* Left — paper preview */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ChangeOfAssetDoc transferId={id} />
        </div>

        {/* Right sidebar */}
        <div className="col gap-4">

          {/* Transfer details */}
          <div className="card" style={{ padding: 20 }}>
            <SectionTitle>Transfer details</SectionTitle>
            <div className="col gap-3">
              {([
                ['Reference', <span key="ref" className="t-mono" style={{ fontWeight: 600, color: 'var(--secondary)' }}>{transfer.referenceNumber}</span>],
                ['Asset', `${asset?.brand} ${asset?.model}`],
                ['Asset Tag', <span key="tag" className="t-mono">{asset?.assetTag}</span>],
                ['Company', company ? (
                  <div key="co" className="row gap-2">
                    <span style={{ fontWeight: 500 }}>{company.name}</span>
                  </div>
                ) : '—'],
                ['Date', fmtDate(transfer.generatedAt)],
                ['Reason', <KindBadge key="reason" kind="out">{TRANSFER_REASON_LABEL[transfer.reason as TransferReason]}</KindBadge>],
                ['Processed by', processedByUser?.name ?? '—'],
                ['Authorised by', transfer.authorisedBy],
              ] as [string, React.ReactNode][]).map(([label, value]) => (
                <div key={label} className="col gap-1">
                  <div className="t-label" style={{ fontSize: 11, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Document actions */}
          <div className="card" style={{ padding: 20 }}>
            <SectionTitle>Document</SectionTitle>
            <div className="col gap-2">
              <button className="btn btn-secondary row gap-2" style={{ justifyContent: 'flex-start' }}
                onClick={() => window.print()}>
                <Icon name="print" size={14} />Print document
              </button>
              <button className="btn btn-secondary row gap-2" style={{ justifyContent: 'flex-start' }}>
                <Icon name="download" size={14} />Download PDF
              </button>
              <button className="btn btn-secondary row gap-2" style={{ justifyContent: 'flex-start' }}
                onClick={() => router.push(`/assets/${asset?.id}`)}>
                <Icon name="eye" size={14} />View asset
              </button>
              {toEmp && (
                <button className="btn btn-secondary row gap-2" style={{ justifyContent: 'flex-start' }}
                  onClick={() => router.push(`/employees/${toEmp.id}`)}>
                  <Icon name="user" size={14} />View {toEmp.name.split(' ')[0]}
                </button>
              )}
              {fromEmp && (
                <button className="btn btn-secondary row gap-2" style={{ justifyContent: 'flex-start' }}
                  onClick={() => router.push(`/employees/${fromEmp.id}`)}>
                  <Icon name="user" size={14} />View {fromEmp.name.split(' ')[0]} (previous)
                </button>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
            <div className="t-label" style={{ marginBottom: 8 }}>Activity</div>
            <div className="col gap-2 muted" style={{ fontSize: 12 }}>
              <div className="row gap-2">
                <Icon name="document" size={12} />
                Generated · {fmtDate(transfer.generatedAt)} by {processedByUser?.name}
              </div>
              <div className="row gap-2">
                <Icon name="check" size={12} />
                Authorised by {transfer.authorisedBy}
              </div>
              {transfer.returnedAt && (
                <div className="row gap-2">
                  <Icon name="arrowDown" size={12} />
                  Returned · {fmtDate(transfer.returnedAt)}
                </div>
              )}
              {transfer.assignedAt && (
                <div className="row gap-2">
                  <Icon name="arrowUp" size={12} />
                  Reissued · {fmtDate(transfer.assignedAt)}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function TransferDocPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('auth_user')
    if (!stored) { router.push('/login'); return }
    setUser(JSON.parse(stored))
  }, [router])

  if (!user) return <Loading />

  return (
    <AppShell user={user} onLogout={() => { localStorage.removeItem('auth_user'); router.push('/login') }}>
      <TransferDocContent id={params.id} />
    </AppShell>
  )
}
