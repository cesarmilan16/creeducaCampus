'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { crearClaseAction } from '@/app/dashboard/profesor/clases/actions'

const schema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function CrearClaseForm({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const result = await crearClaseAction(values)
    if ('error' in result) {
      setServerError(result.error)
    } else {
      router.refresh()
      onClose()
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-4"
    >
      <h3 className="font-semibold text-gray-800">Nueva clase</h3>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Nombre *</label>
        <input
          type="text"
          {...register('nombre')}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.nombre && (
          <p className="text-xs text-red-600">{errors.nombre.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          {...register('descripcion')}
          rows={2}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
          {isSubmitting ? 'Creando...' : 'Crear clase'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
