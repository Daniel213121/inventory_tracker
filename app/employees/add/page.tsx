'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast }        from 'sonner'
import { AppShell }     from '../../../components/layout/AppShell'
import { PageHeader }   from '../../../components/ui/PageHeader'
import { SectionTitle } from '../../../components/ui/SectionTitle'
import { FormRow }      from '../../../components/ui/FormRow'
import { Icon }         from '../../../components/icons/Icon'
import { Loading }      from '../../../components/ui/Loading'
import { BRANCHES, COMPANIES } from '../../../lib/data'

function branchesFor(companyId: string) {
  return companyId ? BRANCHES.filter(b => b.companyId === companyId) : BRANCHES
}

// ─── Content ──────────────────────────────────────────────────────────────

function AddEmployeeContent() {
  const router = useRouter()

  const [companyId, setCompanyId]   = useState('')
  const [branchId, setBranchId]     = useState('')
  const [name, setName]             = useState('')
  const [jobTitle, setJobTitle]     = useState('')
  const [department, setDepartment] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [joinedAt, setJoinedAt]     = useState('')
  const [email, setEmail]           = useState('')
  const [phone, setPhone]           = useState('')
  const [saving, setSaving]         = useState(false)

  useEffect(() => { setBranchId('') }, [companyId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId, branchId, name, jobTitle, department,
          employeeId: employeeId || undefined,
          joinedAt,
          email: email || undefined,
          phone: phone || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')
      toast.success(`${name} added successfully`)
      router.push(`/employees/${data.id}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const availBranches = branchesFor(companyId)

  return (
    <div>
      <PageHeader
        title="Add Employee"
        subtitle="Onboard a new staff member — required before any device can be assigned to them."
        breadcrumb={
          <>
            <button className="btn btn-ghost btn-sm" style={{ padding: 0 }}
              onClick={() => router.push('/employees')}>Employees</button>
            <Icon name="chevronRight" size={14} stroke="var(--text-2)" />
            <span>Add new</span>
          </>
        }
      />

      <form onSubmit={handleSubmit}>
        <div style={{ maxWidth: 880 }}>
          <div className="card" style={{ padding: 24 }}>
            <SectionTitle>Personal details</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

              <FormRow label="Company" required>
                <select className="select" value={companyId}
                  onChange={e => setCompanyId(e.target.value)} required>
                  <option value="">Select company…</option>
                  {COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FormRow>

              <FormRow label="Branch" required>
                <select className="select" value={branchId}
                  onChange={e => setBranchId(e.target.value)} required disabled={!companyId}>
                  <option value="">Select branch…</option>
                  {availBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </FormRow>

              <div style={{ gridColumn: 'span 2' }}>
                <FormRow label="Full Name" required>
                  <input className="input" value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. Felix Anane" required />
                </FormRow>
              </div>

              <FormRow label="Job Title" required>
                <input className="input" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                  placeholder="e.g. IT Manager" required />
              </FormRow>

              <FormRow label="Department" required>
                <input className="input" value={department} onChange={e => setDepartment(e.target.value)}
                  placeholder="e.g. Information Technology" required />
              </FormRow>

              <FormRow label="Employee ID" hint="Internal staff number, if any">
                <input className="input" value={employeeId} onChange={e => setEmployeeId(e.target.value)}
                  placeholder="VSA-0142" />
              </FormRow>

              <FormRow label="Date Joined" required>
                <input className="input" type="date" value={joinedAt}
                  onChange={e => setJoinedAt(e.target.value)} required />
              </FormRow>

              <FormRow label="Email">
                <input className="input" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="felix.anane@virtualsecurity.africa" />
              </FormRow>

              <FormRow label="Phone">
                <input className="input" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+233 24 411 2098" />
              </FormRow>

            </div>
          </div>

          <div className="row gap-2" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="btn btn-secondary"
              onClick={() => router.push('/employees')}>Cancel</button>
            <button type="submit" className="btn btn-primary row gap-2" disabled={saving}>
              <Icon name="plus" size={14} />
              {saving ? 'Saving…' : 'Add Employee'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function AddEmployeePage() {
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
      <AddEmployeeContent />
    </AppShell>
  )
}
