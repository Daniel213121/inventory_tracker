'use client'

import { useRouter } from 'next/navigation'
import { Icon } from '../icons/Icon'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TopBarProps {
  user: { name: string; email: string; id: string }
  onLogout: () => void
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function TopBar({ user, onLogout }: TopBarProps) {
  const router = useRouter()
  return (
    <header style={{
      background: '#fff',
      borderBottom: '1px solid var(--border)',
      padding: '12px 32px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>

      {/* Quick search */}
      <div style={{ flex: 1, maxWidth: 480 }}>
        <Input placeholder="Quick search — items, serials, waybills…" />
      </div>

      <div style={{ marginLeft: 'auto' }} />

      {/* Notifications */}
      <Button variant="ghost" size="sm" className="relative p-2">
        <Icon name="bell" size={18} stroke="var(--text-2)" />
        <span style={{
          position: 'absolute',
          top: 6,
          right: 6,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--error)',
          border: '2px solid #fff',
        }} />
      </Button>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button style={{ background: 'transparent', border: 0, cursor: 'pointer', padding: 4 }}>
            <div className="row gap-3">
              <Avatar style={{ width: 36, height: 36 }}>
                <AvatarFallback style={{
                  background: 'linear-gradient(135deg, #2563EB, #1E3A5F)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 13,
                }}>
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user.name}</div>
                <div className="muted" style={{ fontSize: 11 }}>{user.email}</div>
              </div>
              <Icon name="chevronDown" size={16} stroke="var(--text-2)" />
            </div>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" style={{ width: 220, background: '#fff', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '4px' }}>
          <DropdownMenuItem style={{ gap: 10, fontSize: 14, cursor: 'pointer' }} onClick={() => router.push('/profile')}>
            <Icon name="user" size={16} stroke="var(--text-2)" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem style={{ gap: 10, fontSize: 14, cursor: 'pointer' }} onClick={() => router.push('/settings')}>
            <Icon name="gear" size={16} stroke="var(--text-2)" />
            Account settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onLogout}
            style={{ gap: 10, fontSize: 14, cursor: 'pointer', color: 'var(--error)' }}
          >
            <Icon name="logout" size={16} stroke="var(--error)" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </header>
  )
}
