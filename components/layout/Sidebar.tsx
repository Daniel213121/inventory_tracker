'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '../icons/Icon'
import type { IconName } from '../icons/Icon'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarRail,
} from '@/components/ui/sidebar'

const NAV_ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'grid'     },
  { href: '/inventory', label: 'Inventory', icon: 'package'  },
  { href: '/movements', label: 'Movements', icon: 'arrows'   },
  { href: '/waybills',  label: 'Waybills',  icon: 'document' },
  { href: '/reports',   label: 'Reports',   icon: 'chart'    },
  { href: '/settings',  label: 'Settings',  icon: 'gear'     },
  { href: '/accounts',  label: 'Accounts',  icon: 'users'    },
]

interface AppSidebarProps {
  onLogout: () => void
}

export function AppSidebar({ onLogout }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">

      {/* Brand header */}
      <SidebarHeader className="border-b border-white/8 px-5 py-6">
        <div className="flex items-center gap-3">
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(255,255,255,0.12)',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <Icon name="package" size={20} stroke="#fff" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: '-0.005em', color: '#fff' }}>
              Inventory
            </div>
            <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fff' }}>
              VSA × VIA
            </div>
          </div>
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(item => {
                const active = pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className={active
                        ? '!bg-white !text-[#1E3A5F] border-l-[6px] border-[#2563EB] rounded-none pl-[14px] font-medium'
                        : 'rounded-none font-medium'
                      }
                    >
                      <Link href={item.href}>
                        <Icon
                          name={item.icon}
                          size={18}
                          stroke={active ? '#1E3A5F' : 'rgba(255,255,255,0.78)'}
                        />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-white/8 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              tooltip="Sign out"
              className="rounded-md font-medium"
            >
              <Icon name="logout" size={18} stroke="rgba(255,255,255,0.78)" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div
          className="group-data-[collapsible=icon]:hidden"
          style={{ fontSize: 11, opacity: 0.5, paddingLeft: 12, marginTop: 8, color: '#fff' }}
        >
          v2.4.1 · Build 26052201
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
