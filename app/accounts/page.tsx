'use client'
import { Loading } from '@/components/ui/Loading'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AppShell }   from '../../components/layout/AppShell'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatCard }   from '../../components/ui/StatCard'
import { FormRow }    from '../../components/ui/FormRow'
import { Icon }       from '../../components/icons/Icon'
import { StatusBadge } from '../../components/ui/badges'
import { Input }      from '@/components/ui/input'
import { Button }     from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { USERS, fmtDate } from '../../lib/data'
import type { User } from '../../lib/types'

/* ─── Schema ─────────────────────────────────────────────────────────────── */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const createSchema = z.object({
  name:     z.string().min(1, 'Full name is required'),
  email:    z.string().min(1, 'Email is required').refine(v => emailRegex.test(v), 'Invalid email address'),
  password: z.string().min(10, 'Minimum 10 characters'),
  confirm:  z.string().min(1, 'Please confirm your password'),
}).refine(d => d.password === d.confirm, {
  message: 'Passwords do not match',
  path:    ['confirm'],
})
type CreateFields = z.infer<typeof createSchema>

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = ['#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626']
function avatarColor(name: string) {
  let n = 0
  for (const c of name) n += c.charCodeAt(0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

/* ─── Main content ───────────────────────────────────────────────────────── */

function AccountsContent({ currentUser }: { currentUser: { id: string; name: string; email: string } }) {
  const [users, setUsers]         = useState<User[]>(USERS)
  const [open, setOpen]           = useState(false)
  const [resetUser, setResetUser] = useState<User | null>(null)

  const active   = users.filter(u => u.active)
  const inactive = users.filter(u => !u.active)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFields>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', email: '', password: '', confirm: '' },
  })

  function handleOpenChange(v: boolean) {
    setOpen(v)
    if (!v) reset()
  }

  function create(data: CreateFields) {
    const newUser: User = {
      id:        `u${Date.now()}`,
      name:      data.name.trim(),
      email:     data.email.trim(),
      active:    true,
      createdAt: new Date().toISOString().slice(0, 10),
      lastLogin: null,
    }
    setUsers(prev => [...prev, newUser])
    handleOpenChange(false)
    toast.success(`Account created for ${newUser.name}`)
  }

  function toggleActive(id: string) {
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u
      const next = { ...u, active: !u.active }
      toast.success(`${u.name} is now ${next.active ? 'active' : 'deactivated'}`)
      return next
    }))
  }

  return (
    <div>
      <PageHeader
        title="Accounts"
        subtitle={`${users.length} accounts — all have full read & write access to inventory, movements, and waybills.`}
        actions={
          <>
            <button className="btn btn-primary btn-sm row gap-2" onClick={() => setOpen(true)}>
              <Icon name="plus" size={15} /> Create account
            </button>
          </>
        }
      />

      {/* Stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard icon="users"  label="Active users"  value={active.length}   accent="#16A34A" />
        <StatCard icon="user"   label="Inactive"      value={inactive.length} accent="#6B7280" />
        <StatCard icon="key"    label="Logins today"  value={4}               accent="#2563EB" />
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Created</th>
              <th>Last login</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const isYou = u.email === currentUser.email || u.name === currentUser.name
              const color = avatarColor(u.name)
              return (
                <tr key={u.id}>
                  <td>
                    <div className="row gap-3" style={{ alignItems: 'center' }}>
                      <Avatar style={{ width: 32, height: 32, flexShrink: 0 }}>
                        <AvatarFallback style={{
                          background: color, color: '#fff',
                          fontSize: 11, fontWeight: 700,
                        }}>
                          {initials(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span style={{ fontWeight: 500, fontSize: 13 }}>{u.name}</span>
                        {isYou && (
                          <span className="muted" style={{ fontSize: 12, marginLeft: 6 }}>(you)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="muted" style={{ fontSize: 13 }}>{u.email}</td>
                  <td><StatusBadge active={u.active} /></td>
                  <td className="muted" style={{ fontSize: 13 }}>{fmtDate(u.createdAt)}</td>
                  <td>
                    {u.lastLogin
                      ? <span className="muted" style={{ fontSize: 13 }}>{fmtDate(u.lastLogin)}</span>
                      : <span className="muted" style={{ fontSize: 13 }}>—</span>
                    }
                  </td>
                  <td>
                    <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setResetUser(u)}
                      >
                        Reset password
                      </button>
                      <button
                        className={`btn btn-sm ${u.active ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => toggleActive(u.id)}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Create modal ─────────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent style={{ maxWidth: 480, background: '#fff', borderRadius: 12 }} showCloseButton aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Create new account</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(create)}>
            <div className="col gap-4" style={{ marginTop: 8 }}>
              <FormRow label="Full name" required error={errors.name?.message}>
                <Input {...register('name')} placeholder="e.g. Kofi Mensah" />
              </FormRow>
              <FormRow label="Email address" required error={errors.email?.message}>
                <Input type="email" {...register('email')} placeholder="e.g. kofi@virtualsecurity.africa" />
              </FormRow>
              <FormRow label="Password" required error={errors.password?.message}>
                <Input type="password" {...register('password')} placeholder="Min 10 characters" />
              </FormRow>
              <FormRow label="Confirm password" required error={errors.confirm?.message}>
                <Input type="password" {...register('confirm')} placeholder="Repeat password" />
              </FormRow>

              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: 12, background: '#fef3c7', borderRadius: 6,
                fontSize: 12, color: '#92400e',
              }}>
                <Icon name="alert" size={14} stroke="#92400e" style={{ marginTop: 1, flexShrink: 0 }} />
                All accounts have full read &amp; write access. There are no roles.
              </div>
            </div>

            <DialogFooter style={{ marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={() => handleOpenChange(false)}>Cancel</button>
              <Button type="submit">Create account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Reset password modal ─────────────────────────────────────────── */}
      <Dialog open={!!resetUser} onOpenChange={v => { if (!v) setResetUser(null) }}>
        <DialogContent style={{ maxWidth: 420, background: '#fff', borderRadius: 12 }} showCloseButton aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
          </DialogHeader>

          <div className="col gap-2" style={{ marginTop: 4 }}>
            <p style={{ fontSize: 14 }}>
              Send a password reset link to <strong>{resetUser?.email}</strong>?
            </p>
            <p className="muted" style={{ fontSize: 13 }}>
              They&apos;ll receive a one-time link valid for 10 minutes.
            </p>
          </div>

          <DialogFooter>
            <button className="btn btn-secondary" onClick={() => setResetUser(null)}>Cancel</button>
            <Button onClick={() => {
              toast.success(`Reset link sent to ${resetUser?.email}`)
              setResetUser(null)
            }}>
              Send reset email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ─── Page wrapper ───────────────────────────────────────────────────────── */

export default function AccountsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('auth_user')
    if (!stored) { router.push('/login'); return }
    const parsed = JSON.parse(stored)
    setUser(parsed)
  }, [router])

  if (!user) return <Loading />

  return (
    <AppShell user={user} onLogout={() => { localStorage.removeItem('auth_user'); router.push('/login') }}>
      <AccountsContent currentUser={user} />
    </AppShell>
  )
}
