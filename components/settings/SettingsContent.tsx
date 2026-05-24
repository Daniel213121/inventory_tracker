'use client'

import { useState } from 'react'
import { PageHeader } from '../ui/PageHeader'
import { SettingsNav } from './SettingsNav'
import { CompanyForm } from './CompanyForm'
import type { Company } from '../../lib/types'

export function SettingsContent() {
  const [active, setActive] = useState('vsa')

  function handleSave(updated: Company) {
    console.log('Saved:', updated)
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage company profiles. Values here flow into every new waybill."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
        <SettingsNav active={active} onSelect={setActive} />

        <CompanyForm key={active} companyId={active} onSave={handleSave} />
      </div>
    </div>
  )
}
