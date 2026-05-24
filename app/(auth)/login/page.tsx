'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Icon } from '../../../components/icons/Icon'
import { toast } from 'sonner'

const DEMO_EMAIL    = 'akua.sarpong@virtualsecurity.africa'
const DEMO_PASSWORD = 'demo1234'

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current opacity-90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
)

/* ─── Zod schema ─────────────────────────────────────────────────────────── */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const schema = z.object({
  email:    z.string().min(1, 'Email is required').refine(v => emailRegex.test(v), 'Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
type Fields = z.infer<typeof schema>

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
  })

  const onSubmit = (data: Fields) => {
    setIsSubmitting(true)
    setTimeout(() => {
      localStorage.setItem('auth_user', JSON.stringify({ email: data.email, name: 'Akua Sarpong', id: 'u01' }))
      toast.success('Welcome back, Akua Sarpong!', { description: 'Redirecting to your dashboard…' })
      setTimeout(() => router.push('/dashboard'), 1000)
    }, 1500)
  }

  return (
    <main className="min-h-screen bg-white lg:bg-[#eef1f6]">
      <div className="flex flex-col min-h-screen lg:flex-row">

        {/* ── LEFT: Brand panel ───────────────────────────────────────── */}
        <div className="sticky top-0 z-0 order-1 flex w-full h-[35vh] min-h-[220px] md:h-[40vh] lg:relative lg:order-none lg:flex-1 lg:min-h-[100vh] lg:h-auto items-center justify-center overflow-hidden bg-gradient-to-br from-[#1E3A5F] to-[#2563EB]">
          <div className="flex h-full w-full flex-col justify-between p-8 lg:p-14 text-white relative">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
              <div className="absolute bottom-20 -left-16 h-56 w-56 rounded-full bg-white/5 blur-2xl" />
            </div>

            <div className="relative flex items-center gap-4">
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.16)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="package" size={22} stroke="#fff" />
              </div>
              <div>
                <div className="text-[15px] font-semibold">Inventory Tracker</div>
                <div className="text-[12px] opacity-60">VSA × VIA shared deployment</div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.55 }}
              className="relative flex flex-col"
            >
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Internal Platform · 2 Companies
              </div>
              <h1 className="text-[42px] font-bold leading-[1.12] tracking-[-0.02em] text-white mb-6">
                Track every drive,<br />switch and server —<br />
                <span className="text-white/70">from receipt to dispatch.</span>
              </h1>
              <p className="text-[15px] leading-[1.7] text-white/70 max-w-[360px]">
                One ledger for <strong className="text-white font-semibold">Virtual Security Africa</strong> and{' '}
                <strong className="text-white font-semibold">Virtual Infosec Africa</strong>.
                Movements logged, waybills generated, signatures captured — every time.
              </p>
            </motion.div>

            <p className="relative text-[12px] text-white/40">
              © 2026 VSA + VIA. Internal tool — authorized personnel only.
            </p>
          </div>
        </div>

        {/* ── RIGHT: Form ──────────────────────────────────────────────── */}
        <div className="relative z-20 order-2 flex flex-1 flex-col items-stretch justify-start bg-white -mt-10 rounded-t-3xl pt-8 pb-10 px-5 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:-mt-16 md:rounded-t-[40px] md:pt-12 md:px-10 lg:mt-0 lg:rounded-none lg:order-none lg:items-center lg:justify-center lg:bg-[#f8fafc] lg:px-12 lg:py-10 lg:shadow-none">
          <div className="flex w-full max-w-full flex-col gap-4 md:mx-auto md:max-w-[460px] lg:max-w-[420px] lg:flex-1 lg:gap-5 lg:justify-center">

            <div className="text-center lg:text-left">
              <h2 className="mb-1 text-[28px] font-bold tracking-[-0.02em] text-[#0f172a]">Welcome back</h2>
              <p className="text-[15px] text-[#64748b]">Sign in to access the inventory system.</p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, type: 'spring', bounce: 0 }}
              className="w-full rounded-2xl bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.15)] lg:p-[26px] lg:shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 lg:gap-5">

                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-2 block text-[13px] font-semibold text-[#475569] lg:text-[14px] lg:text-[#334155]">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Icon name="mail" size={15} stroke="#94a3b8" style={{ position: 'absolute', left: 12, pointerEvents: 'none' }} />
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@virtualsecurity.africa"
                      className="pl-9 focus-visible:ring-[#2563eb]/20 focus-visible:border-[#2563eb]"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="mb-2 block text-[13px] font-semibold text-[#475569] lg:text-[14px] lg:text-[#334155]">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Icon name="lock" size={15} stroke="#94a3b8" style={{ position: 'absolute', left: 12, pointerEvents: 'none' }} />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="pl-9 pr-10 focus-visible:ring-[#2563eb]/20 focus-visible:border-[#2563eb]"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      className="absolute right-3 grid h-7 w-7 place-items-center rounded-full text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#475569]"
                      aria-label="Toggle password"
                      onClick={() => setShowPassword(v => !v)}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>
                  )}
                </div>

                {/* Remember + forgot */}
                <div className="flex items-center justify-between gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#475569]">
                    <input type="checkbox" name="remember" defaultChecked className="h-4 w-4 cursor-pointer accent-[#2563eb]" />
                    <span>Remember me</span>
                  </label>
                  <Link href="#forgot" className="text-[13px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors">
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit */}
                <motion.div whileHover={isSubmitting ? {} : { scale: 1.015 }} whileTap={isSubmitting ? {} : { scale: 0.97 }}>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-br from-[#1E3A5F] to-[#2563EB] text-white font-semibold text-[15px] py-5 hover:shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-75 transition-all"
                  >
                    {isSubmitting && <Spinner />}
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </div>

      </div>
    </main>
  )
}
