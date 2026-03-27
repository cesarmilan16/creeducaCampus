'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Usuario } from '@/types'

const schema = z.object({
  para_usuario: z.string().min(1, 'Selecciona un destinatario'),
  asunto: z.string().optional(),
  cuerpo: z.string().min(1, 'El mensaje no puede estar vacío'),
})

type FormValues = z.infer<typeof schema>

type EnviarAction = (data: {
  para_usuario: string
  asunto?: string
  cuerpo: string
}) => Promise<{ error: string } | { success: true }>

export default function NuevoMensajeForm({
  usuarios,
  enviarAction,
  onClose,
}: {
  usuarios: Pick<Usuario, 'id' | 'nombre'>[]
  enviarAction: EnviarAction
  onClose: () => void
}) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const result = await enviarAction(values)
    if ('error' in result) {
      setServerError(result.error)
    } else {
      reset()
      router.refresh()
      onClose()
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-4"
    >
      <h3 className="font-semibold text-gray-800">Nuevo mensaje</h3>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Para *</label>
        <select
          {...register('para_usuario')}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona un destinatario</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>
        {errors.para_usuario && (
          <p className="text-xs text-red-600">{errors.para_usuario.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Asunto</label>
        <input
          type="text"
          {...register('asunto')}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Mensaje *</label>
        <textarea
          rows={4}
          {...register('cuerpo')}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.cuerpo && (
          <p className="text-xs text-red-600">{errors.cuerpo.message}</p>
        )}
      </div>

      {serverError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </button>
        <button
          type="button"
          onClick={() => { onClose(); reset() }}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
