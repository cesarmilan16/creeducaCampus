'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { registroAction } from '@/app/(auth)/registro/actions'

const registroSchema = z
  .object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Introduce un email válido'),
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
    rol: z.enum(['profesor', 'alumno'], { message: 'Selecciona un rol' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type RegistroFormValues = z.infer<typeof registroSchema>

export default function RegistroForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistroFormValues>({
    resolver: zodResolver(registroSchema),
  })

  async function onSubmit(values: RegistroFormValues) {
    setServerError(null)
    const result = await registroAction({
      nombre: values.nombre,
      email: values.email,
      password: values.password,
      rol: values.rol,
    })
    if ('error' in result) {
      setServerError(result.error)
    } else {
      router.push(result.redirectTo)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="nombre" className="text-sm font-medium text-gray-700">
          Nombre completo
        </label>
        <input
          id="nombre"
          type="text"
          autoComplete="name"
          {...register('nombre')}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.nombre && (
          <p className="text-xs text-red-600">{errors.nombre.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-gray-700"
        >
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="rol" className="text-sm font-medium text-gray-700">
          Rol
        </label>
        <select
          id="rol"
          {...register('rol')}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona un rol</option>
          <option value="alumno">Alumno</option>
          <option value="profesor">Profesor</option>
        </select>
        {errors.rol && (
          <p className="text-xs text-red-600">{errors.rol.message}</p>
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
        className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  )
}
