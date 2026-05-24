'use client'

import { createContext, useContext } from 'react'
import { toast } from 'sonner'
import { Toaster } from './sonner'

interface ToastContextValue {
  push: (msg: string, kind?: 'success' | 'error') => void
}

function push(msg: string, kind: 'success' | 'error' = 'success') {
  if (kind === 'error') {
    toast.error(msg)
  } else {
    toast.success(msg)
  }
}

export const ToastContext = createContext<ToastContextValue>({ push })

export function ToastHost({ children }: { children: React.ReactNode }) {
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <Toaster position="bottom-right" richColors />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext)
}
