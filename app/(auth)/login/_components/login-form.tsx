'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { loginAction } from '@/app/(auth)/login/actions'

// ── Credenciales de demostración ──────────────────────────────────────────────
const DEMO_PROFESOR = { email: 'profesor@creeduca.com', password: 'demo1234' }
const DEMO_ALUMNO   = { email: 'alumno@creeduca.com',   password: 'demo1234' }
// ─────────────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Introduce un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    setServerError(null)
    const result = await loginAction(values)
    if ('error' in result) {
      setServerError(result.error)
    } else {
      router.push(result.redirectTo)
    }
  }

  function loginDemo(creds: { email: string; password: string }) {
    setValue('email', creds.email)
    setValue('password', creds.password)
    handleSubmit(onSubmit)()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="password"
          className="text-sm font-medium text-gray-700"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      {serverError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-full bg-[#1B3557] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#162c46] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>

      {/* Demo */}
      <div className="mt-1 rounded-2xl bg-gray-50 px-4 py-3.5">
        <div className="mb-3 flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <p className="text-xs font-medium text-gray-500">Acceso de demostración</p>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => loginDemo(DEMO_PROFESOR)}
            className="flex items-center gap-2.5 rounded-full bg-[#1B3557] px-4 py-2 text-xs font-medium text-white hover:bg-[#162c46] disabled:opacity-50 transition-colors"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            Entrar como Profesor
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => loginDemo(DEMO_ALUMNO)}
            className="flex items-center gap-2.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            Entrar como Alumno
          </button>
        </div>
      </div>
    </form>
  )
}
