'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Usuario } from '@/types'

const perfilSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
})

const passwordSchema = z
  .object({
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmar: z.string().min(1, 'Confirma la contraseña'),
  })
  .refine((d) => d.password === d.confirmar, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmar'],
  })

type PerfilValues = z.infer<typeof perfilSchema>
type PasswordValues = z.infer<typeof passwordSchema>

type ActualizarPerfilAction = (
  data: { nombre: string }
) => Promise<{ error: string } | { success: true }>

type CambiarPasswordAction = (
  data: { password: string }
) => Promise<{ error: string } | { success: true }>

export default function ConfiguracionPanel({
  usuario,
  actualizarPerfilAction,
  cambiarPasswordAction,
}: {
  usuario: Usuario
  actualizarPerfilAction: ActualizarPerfilAction
  cambiarPasswordAction: CambiarPasswordAction
}) {
  const router = useRouter()
  const [perfilOk, setPerfilOk] = useState(false)
  const [passwordOk, setPasswordOk] = useState(false)
  const [perfilError, setPerfilError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const perfilForm = useForm<PerfilValues>({
    resolver: zodResolver(perfilSchema),
    defaultValues: { nombre: usuario.nombre },
  })

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmar: '' },
  })

  async function onPerfilSubmit(values: PerfilValues) {
    setPerfilError(null)
    setPerfilOk(false)
    const result = await actualizarPerfilAction(values)
    if ('error' in result) {
      setPerfilError(result.error)
    } else {
      setPerfilOk(true)
      router.refresh()
    }
  }

  async function onPasswordSubmit(values: PasswordValues) {
    setPasswordError(null)
    setPasswordOk(false)
    const result = await cambiarPasswordAction({ password: values.password })
    if ('error' in result) {
      setPasswordError(result.error)
    } else {
      setPasswordOk(true)
      passwordForm.reset()
    }
  }

  const avatarBg = usuario.rol === 'profesor' ? 'bg-[#1B3557]' : 'bg-emerald-600'
  const inicial = usuario.nombre.charAt(0).toUpperCase()

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Avatar + info */}
      <div className="rounded-2xl border border-[#E5E0D9] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full ${avatarBg} text-2xl font-bold text-white`}
          >
            {inicial}
          </div>
          <div>
            <p className="text-lg font-semibold text-[#1B3557]">{usuario.nombre}</p>
            <p className="text-sm text-gray-400">{usuario.email}</p>
            <span className="mt-1 inline-block rounded-full bg-[#EBF0F7] px-2.5 py-0.5 text-xs font-medium text-[#1B3557] capitalize">
              {usuario.rol}
            </span>
          </div>
        </div>
      </div>

      {/* Editar perfil */}
      <div className="rounded-2xl border border-[#E5E0D9] bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-[#1B3557]">Información personal</h2>
        <form onSubmit={perfilForm.handleSubmit(onPerfilSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">Nombre completo</label>
            <input
              type="text"
              {...perfilForm.register('nombre')}
              className="rounded-xl border border-[#E5E0D9] px-3 py-2 text-sm text-[#1B3557] focus:outline-none focus:ring-2 focus:ring-[#1B3557]/20"
            />
            {perfilForm.formState.errors.nombre && (
              <p className="text-xs text-red-500">{perfilForm.formState.errors.nombre.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              value={usuario.email}
              disabled
              className="rounded-xl border border-[#E5E0D9] bg-gray-50 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400">El email no se puede modificar.</p>
          </div>

          {perfilError && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{perfilError}</p>
          )}
          {perfilOk && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
              Perfil actualizado correctamente.
            </p>
          )}

          <button
            type="submit"
            disabled={perfilForm.formState.isSubmitting}
            className="rounded-xl bg-[#1B3557] px-4 py-2 text-sm font-semibold text-white hover:bg-[#152840] disabled:opacity-50 transition-colors"
          >
            {perfilForm.formState.isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Cambiar contraseña */}
      <div className="rounded-2xl border border-[#E5E0D9] bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-[#1B3557]">Cambiar contraseña</h2>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">Nueva contraseña</label>
            <input
              type="password"
              {...passwordForm.register('password')}
              placeholder="Mínimo 6 caracteres"
              className="rounded-xl border border-[#E5E0D9] px-3 py-2 text-sm text-[#1B3557] focus:outline-none focus:ring-2 focus:ring-[#1B3557]/20"
            />
            {passwordForm.formState.errors.password && (
              <p className="text-xs text-red-500">
                {passwordForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">Confirmar contraseña</label>
            <input
              type="password"
              {...passwordForm.register('confirmar')}
              placeholder="Repite la contraseña"
              className="rounded-xl border border-[#E5E0D9] px-3 py-2 text-sm text-[#1B3557] focus:outline-none focus:ring-2 focus:ring-[#1B3557]/20"
            />
            {passwordForm.formState.errors.confirmar && (
              <p className="text-xs text-red-500">
                {passwordForm.formState.errors.confirmar.message}
              </p>
            )}
          </div>

          {passwordError && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{passwordError}</p>
          )}
          {passwordOk && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
              Contraseña actualizada correctamente.
            </p>
          )}

          <button
            type="submit"
            disabled={passwordForm.formState.isSubmitting}
            className="rounded-xl bg-[#1B3557] px-4 py-2 text-sm font-semibold text-white hover:bg-[#152840] disabled:opacity-50 transition-colors"
          >
            {passwordForm.formState.isSubmitting ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
