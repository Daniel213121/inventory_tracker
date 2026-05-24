'use client'

import { useState } from 'react'
import type { Tweaks } from '../../lib/types'

export const TWEAK_DEFAULTS: Tweaks = {
  density:       'comfortable',
  dashLayout:    'split',
  stockOutFlow:  'stepper',
  waybillLayout: 'modern',
}

export function useTweaks(defaults: Tweaks = TWEAK_DEFAULTS): Tweaks & {
  setTweak: <K extends keyof Tweaks>(key: K, value: Tweaks[K]) => void
  open: boolean
  setOpen: (open: boolean) => void
} {
  const [tweaks, setTweaks] = useState<Tweaks>(defaults)
  const [open, setOpen] = useState(false)

  function setTweak<K extends keyof Tweaks>(key: K, value: Tweaks[K]) {
    setTweaks(prev => ({ ...prev, [key]: value }))
  }

  return { ...tweaks, setTweak, open, setOpen }
}
