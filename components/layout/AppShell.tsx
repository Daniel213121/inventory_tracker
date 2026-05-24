'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { AppSidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { ToastHost } from '../ui/Toast'
import { TweaksPanel, TweakSection, TweakRadio } from '../tweaks/TweaksPanel'
import { useTweaks, TWEAK_DEFAULTS } from '../tweaks/useTweaks'
import { Icon } from '../icons/Icon'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export const TweaksContext = createContext<ReturnType<typeof useTweaks> | null>(null)

export function useTweaksContext() {
  return useContext(TweaksContext)!
}

interface AppShellProps {
  user: { id: string; name: string; email: string }
  onLogout: () => void
  children: React.ReactNode
}

export function AppShell({ user, onLogout, children }: AppShellProps) {
  const tweaks = useTweaks(TWEAK_DEFAULTS)

  useEffect(() => {
    document.body.setAttribute('data-density', tweaks.density)
  }, [tweaks.density])

  return (
    <ToastHost>
      <TweaksContext.Provider value={tweaks}>
        <SidebarProvider>
          <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', width: '100%' }}>
            <AppSidebar onLogout={onLogout} />
            <SidebarInset className="col" style={{ flex: 1, minWidth: 0 }}>
              <TopBar user={user} onLogout={onLogout} />
              <main style={{ padding: '28px 32px 64px', flex: 1, minWidth: 0 }}>
                {children}
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>

        <TweaksPanel open={tweaks.open} onClose={() => tweaks.setOpen(false)}>
          <TweakSection label="Density">
            <TweakRadio
              label="Tables & forms"
              value={tweaks.density}
              options={[
                { value: 'compact',     label: 'Compact'  },
                { value: 'comfortable', label: 'Cozy'     },
                { value: 'spacious',    label: 'Spacious' },
              ]}
              onChange={v => tweaks.setTweak('density', v as typeof tweaks.density)}
            />
          </TweakSection>

          <TweakSection label="Dashboard layout">
            <TweakRadio
              label="Arrangement"
              value={tweaks.dashLayout}
              options={[
                { value: 'split',   label: 'Split'  },
                { value: 'wide',    label: 'Wide'   },
                { value: 'thirds',  label: 'Thirds' },
              ]}
              onChange={v => tweaks.setTweak('dashLayout', v as typeof tweaks.dashLayout)}
            />
          </TweakSection>

          <TweakSection label="Stock-Out flow">
            <TweakRadio
              label="Form style"
              value={tweaks.stockOutFlow}
              options={[
                { value: 'stepper',  label: 'Stepper'     },
                { value: 'single',   label: 'Single page' },
              ]}
              onChange={v => tweaks.setTweak('stockOutFlow', v as typeof tweaks.stockOutFlow)}
            />
          </TweakSection>

          <TweakSection label="Waybill layout">
            <TweakRadio
              label="Template"
              value={tweaks.waybillLayout}
              options={[
                { value: 'modern',  label: 'Modern'  },
                { value: 'classic', label: 'Classic' },
                { value: 'compact', label: 'Compact' },
              ]}
              onChange={v => tweaks.setTweak('waybillLayout', v as typeof tweaks.waybillLayout)}
            />
          </TweakSection>
        </TweaksPanel>

        <button
          onClick={() => tweaks.setOpen(!tweaks.open)}
          className="btn btn-secondary btn-sm"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 40,
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            gap: 6,
          }}
        >
          <Icon name="gear" size={15} /> Tweaks
        </button>
      </TweaksContext.Provider>
    </ToastHost>
  )
}
