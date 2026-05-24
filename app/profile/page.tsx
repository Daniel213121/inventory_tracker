'use client'
import { Loading } from '@/components/ui/Loading'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { AppShell }    from '../../components/layout/AppShell'
import { PageHeader }  from '../../components/ui/PageHeader'
import { FormRow }     from '../../components/ui/FormRow'
import { Icon }        from '../../components/icons/Icon'
import { StatusBadge } from '../../components/ui/badges'
import { Input }       from '@/components/ui/input'
import { Button }      from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { USERS, fmtDate } from '../../lib/data'
import type { User } from '../../lib/types'

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

/* ─── Schemas ────────────────────────────────────────────────────────────── */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const profileSchema = z.object({
  name:  z.string().min(1, 'Full name is required'),
  email: z.string().min(1, 'Email is required').refine(v => emailRegex.test(v), 'Invalid email address'),
})
type ProfileFields = z.infer<typeof profileSchema>

const passwordSchema = z.object({
  currentPw: z.string().min(1, 'Current password is required'),
  newPw:     z.string().min(10, 'Minimum 10 characters'),
  confirmPw: z.string().min(1, 'Please confirm your password'),
}).refine(d => d.newPw === d.confirmPw, {
  message: 'Passwords do not match',
  path:    ['confirmPw'],
})
type PasswordFields = z.infer<typeof passwordSchema>

/* ─── Profile content ───────────────────────────────────────────────────── */

function ProfileContent({ authUser }: { authUser: { id: string; name: string; email: string } }) {
  const router = useRouter()

  const found = USERS.find(u => u.email === authUser.email) ?? null
  const [user, setUser] = useState<User>(
    found ?? { id: authUser.id, name: authUser.name, email: authUser.email, active: true, createdAt: '', lastLogin: null }
  )

  /* ── Profile form ─────────────────────────────────────────────────────── */
  const {
    register: regProfile,
    handleSubmit: submitProfile,
    formState: { errors: profileErrors, isDirty: profileDirty },
  } = useForm<ProfileFields>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, email: user.email },
  })

  function saveProfile(data: ProfileFields) {
    setUser(prev => ({ ...prev, name: data.name, email: data.email }))
    toast.success('Profile updated')
  }

  /* ── Password form ────────────────────────────────────────────────────── */
  const {
    register: regPassword,
    handleSubmit: submitPassword,
    reset:    resetPassword,
    formState: { errors: pwErrors },
  } = useForm<PasswordFields>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPw: '', newPw: '', confirmPw: '' },
  })

  function savePassword(_data: PasswordFields) {
    resetPassword()
    toast.success('Password changed successfully')
  }

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Manage your personal information and security settings."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'flex-start' }}>

        {/* ── Left: identity card ──────────────────────────────────────── */}
        <div className="col gap-4">
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <Avatar style={{ width: 72, height: 72 }}>
                <AvatarFallback style={{
                  background: 'linear-gradient(135deg, #2563EB, #1E3A5F)',
                  color: '#fff', fontWeight: 700, fontSize: 22,
                }}>
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{user.name}</div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>{user.email}</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <StatusBadge active={user.active} />
            </div>
            <div style={{ borderTop: '1px solid var(--border)', margin: '20px 0 16px' }} />
            <div className="col gap-3" style={{ textAlign: 'left' }}>
              <div>
                <div className="t-label" style={{ fontSize: 11, marginBottom: 2 }}>Member since</div>
                <div style={{ fontSize: 13 }}>{user.createdAt ? fmtDate(user.createdAt) : '—'}</div>
              </div>
              <div>
                <div className="t-label" style={{ fontSize: 11, marginBottom: 2 }}>Last login</div>
                <div style={{ fontSize: 13 }}>{user.lastLogin ? fmtDate(user.lastLogin) : '—'}</div>
              </div>
            </div>
          </div>

          <button
            className="btn btn-secondary row gap-2"
            style={{ width: '100%', justifyContent: 'center', color: 'var(--error)', borderColor: '#fecaca' }}
            onClick={() => { localStorage.removeItem('auth_user'); router.push('/login') }}
          >
            <Icon name="logout" size={15} stroke="var(--error)" />
            Sign out
          </button>
        </div>

        {/* ── Right: forms ─────────────────────────────────────────────── */}
        <div className="col gap-4">

          {/* Personal information */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Personal information</div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 20 }}>Update your name and email address.</div>
            <form onSubmit={submitProfile(saveProfile)}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FormRow label="Full name" required span={2} error={profileErrors.name?.message}>
                  <Input {...regProfile('name')} placeholder="Your full name" />
                </FormRow>
                <FormRow label="Email address" required span={2} error={profileErrors.email?.message}>
                  <Input type="email" {...regProfile('email')} placeholder="your@email.com" />
                </FormRow>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <Button type="submit" disabled={!profileDirty}>Save changes</Button>
              </div>
            </form>
          </div>

          {/* Change password */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Change password</div>
            <div className="muted" style={{ fontSize: 13, marginBottom: 20 }}>Choose a strong password of at least 10 characters.</div>
            <form onSubmit={submitPassword(savePassword)}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FormRow label="Current password" required span={2} error={pwErrors.currentPw?.message}>
                  <Input type="password" {...regPassword('currentPw')} placeholder="Enter current password" />
                </FormRow>
                <FormRow label="New password" required error={pwErrors.newPw?.message}>
                  <Input type="password" {...regPassword('newPw')} placeholder="Min 10 characters" />
                </FormRow>
                <FormRow label="Confirm new password" required error={pwErrors.confirmPw?.message}>
                  <Input type="password" {...regPassword('confirmPw')} placeholder="Repeat new password" />
                </FormRow>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <Button type="submit">Update password</Button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}

/* ─── Page wrapper ───────────────────────────────────────────────────────── */

export default function ProfilePage() {
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
      <ProfileContent authUser={user} />
    </AppShell>
  )
}
