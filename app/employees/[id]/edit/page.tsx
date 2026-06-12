'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast }        from 'sonner'
import { AppShell }     from '../../../../components/layout/AppShell'
import { PageHeader }   from '../../../../components/ui/PageHeader'
import { SectionTitle } from '../../../../components/ui/SectionTitle'
import { FormRow }      from '../../../../components/ui/FormRow'
import { Icon }         from '../../../../components/icons/Icon'
import { Loading }      from '../../../../components/ui/Loading'
import { getEmployee, updateEmployee } from '../../../../app/actions/employees'
import { listCompanies, listBranches, createBranch } from '../../../../app/actions/settings'
import type { Company, Branch, Employee } from '../../../../lib/types'

// ─── Content ──────────────────────────────────────────────────────────────

function EditEmployeeContent({ id }: { id: string }) {
  const router = useRouter()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading]   = useState(true)

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

  const [companies, setCompanies] = useState<Company[]>([])
  const [branches, setBranches]   = useState<Branch[]>([])

  const [isAddingBranch, setIsAddingBranch] = useState(false)
  const [newBranchName, setNewBranchName]   = useState('')
  const [branchSaving, setBranchSaving]     = useState(false)

  useEffect(() => {
    listCompanies().then(setCompanies)
  }, [])

  useEffect(() => {
    listBranches(companyId || undefined).then(setBranches)
  }, [companyId])

  useEffect(() => {
    setLoading(true)
    getEmployee(id).then(emp => {
      if (emp) {
        const ex = emp as Employee
        setEmployee(ex)
        setCompanyId(ex.companyId)
        setBranchId(ex.branchId)
        setName(ex.name)
        setJobTitle(ex.jobTitle)
        setDepartment(ex.department)
        setEmployeeId(ex.employeeId ?? '')
        setJoinedAt(ex.joinedAt.slice(0, 10))
        setEmail(ex.email ?? '')
        setPhone(ex.phone ?? '')
      }
      setLoading(false)
    })
  }, [id])

  function handleBranchChange(value: string) {
    if (value === '__add_new__') { setIsAddingBranch(true); return }
    setBranchId(value)
  }

  async function confirmNewBranch() {
    const branchName = newBranchName.trim()
    if (!branchName || !companyId) return
    setBranchSaving(true)
    try {
      const branch = await createBranch(branchName, companyId)
      setBranches(prev => [...prev, branch])
      setBranchId(branch.id)
      setIsAddingBranch(false)
      setNewBranchName('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create branch')
    } finally {
      setBranchSaving(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateEmployee(id, {
        companyId, branchId, name, jobTitle, department,
        employeeId: employeeId || null,
        joinedAt,
        email: email || null,
        phone: phone || null,
      })
      toast.success(`${name} updated`)
      router.push(`/employees/${id}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const availBranches = branches

  if (loading || !employee) return <Loading />

  return (
    <div>
      <PageHeader
        title={`Edit ${employee.name}`}
        subtitle="Update employee details."
        breadcrumb={
          <>
            <button className="btn btn-ghost btn-sm" style={{ padding: 0 }}
              onClick={() => router.push('/employees')}>Employees</button>
            <Icon name="chevronRight" size={14} stroke="var(--text-2)" />
            <button className="btn btn-ghost btn-sm" style={{ padding: 0 }}
              onClick={() => router.push(`/employees/${id}`)}>{employee.name}</button>
            <Icon name="chevronRight" size={14} stroke="var(--text-2)" />
            <span>Edit</span>
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
                  onChange={e => { setCompanyId(e.target.value); setBranchId('') }} required>
                  <option value="">Select company…</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FormRow>

              <FormRow label="Branch" required>
                <select className="select" value={branchId}
                  onChange={e => handleBranchChange(e.target.value)} required disabled={!companyId}>
                  <option value="">Select branch…</option>
                  {availBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  <option value="__add_new__">+ Add new branch</option>
                </select>
                {isAddingBranch && (
                  <div className="row gap-2" style={{ marginTop: 8 }}>
                    <input className="input" value={newBranchName}
                      onChange={e => setNewBranchName(e.target.value)}
                      placeholder="e.g. Kumasi Office" autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); confirmNewBranch() } }} />
                    <button type="button" className="btn btn-primary btn-sm" onClick={confirmNewBranch} disabled={branchSaving}>
                      {branchSaving ? '…' : 'Add'}
                    </button>
                  </div>
                )}
              </FormRow>

              <div style={{ gridColumn: 'span 2' }}>
                <FormRow label="Full Name" required>
                  <input className="input" value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. Kwame Mensah" required />
                </FormRow>
              </div>

              <FormRow label="Job Title" required>
                <input className="input" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                  placeholder="e.g. Accountant" required />
              </FormRow>

              <FormRow label="Department" required>
                <input className="input" value={department} onChange={e => setDepartment(e.target.value)}
                  placeholder="e.g. Finance" required />
              </FormRow>

              <FormRow label="Employee ID" hint="Optional, must be unique">
                <input className="input t-mono" value={employeeId} onChange={e => setEmployeeId(e.target.value)}
                  placeholder="e.g. VSA-0042" />
              </FormRow>

              <FormRow label="Date Joined" required>
                <input className="input" type="date" value={joinedAt}
                  onChange={e => setJoinedAt(e.target.value)} required />
              </FormRow>

              <FormRow label="Email">
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com" />
              </FormRow>

              <FormRow label="Phone">
                <input className="input" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="0XX XXX XXXX" />
              </FormRow>

            </div>
          </div>

          {/* Actions */}
          <div className="row gap-2" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="btn btn-secondary"
              onClick={() => router.push(`/employees/${id}`)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

        </div>
      </form>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function EditEmployeePage() {
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
      <EditEmployeeContent id={params.id} />
    </AppShell>
  )
}
