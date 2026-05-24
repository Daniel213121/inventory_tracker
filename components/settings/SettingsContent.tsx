'use client'

import { useEffect, useState } from 'react'
import { PageHeader }          from '../ui/PageHeader'
import { Loading }             from '../ui/Loading'
import { SettingsNav }         from './SettingsNav'
import { CompanyForm }         from './CompanyForm'
import { listCompanies }       from '@/app/actions/settings'
import type { Company }        from '../../lib/types'

export function SettingsContent() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [activeId,  setActiveId]  = useState<string | null>(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    listCompanies()
      .then(rows => {
        const cos = rows as unknown as Company[]
        setCompanies(cos)
        if (cos.length > 0) setActiveId(cos[0].id)
      })
      .finally(() => setLoading(false))
  }, [])

  function handleSave(updated: Company) {
    setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  const activeCompany = companies.find(c => c.id === activeId) ?? null

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage company profiles. Values here flow into every new waybill."
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
          <Loading />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
          <SettingsNav
            companies={companies}
            active={activeId ?? ''}
            onSelect={setActiveId}
          />

          {activeCompany && (
            <CompanyForm
              key={activeCompany.id}
              company={activeCompany}
              onSave={handleSave}
            />
          )}
        </div>
      )}
    </div>
  )
}
