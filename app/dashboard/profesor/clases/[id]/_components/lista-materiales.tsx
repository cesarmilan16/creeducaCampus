'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Material } from '@/types'
import {
  agregarMaterialAction,
  eliminarMaterialAction,
} from '@/app/dashboard/profesor/clases/[id]/actions'

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  tipo: z.enum(['enlace', 'video', 'documento', 'otro']),
  url: z.string().url('Introduce una URL válida'),
})

type FormValues = z.infer<typeof schema>

const TIPO_ICONS: Record<string, string> = {
  enlace: '🔗',
  video: '🎥',
  documento: '📄',
  otro: '📎',
}

export default function ListaMateriales({
  materiales,
  claseId,
}: {
  materiales: Material[]
  claseId: string
}) {
  const router = useRouter()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: 'enlace' },
  })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const result = await agregarMaterialAction({ ...values, clase_id: claseId })
    if ('error' in result) {
      setServerError(result.error)
    } else {
      reset()
      setMostrarForm(false)
      router.refresh()
    }
  }

  async function handleEliminar(id: string) {
    const result = await eliminarMaterialAction(id)
    if ('error' in result) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Materiales</h2>
        {!mostrarForm && (
          <button
            onClick={() => setMostrarForm(true)}
            className="text-sm text-blue-600 hover:underline"
          >
            + Añadir material
          </button>
        )}
      </div>

      {mostrarForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">Nombre *</label>
              <input
                type="text"
                {...register('nombre')}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.nombre && (
                <p className="text-xs text-red-600">{errors.nombre.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">Tipo</label>
              <select
                {...register('tipo')}
                className="rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="enlace">Enlace</option>
                <option value="video">Vídeo</option>
                <option value="documento">Documento</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">URL *</label>
            <input
              type="url"
              placeholder="https://..."
              {...register('url')}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.url && (
              <p className="text-xs text-red-600">{errors.url.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-700">Descripción</label>
            <input
              type="text"
              {...register('descripcion')}
              className="rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {serverError && (
            <p className="text-sm text-red-600">{serverError}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Añadiendo...' : 'Añadir'}
            </button>
            <button
              type="button"
              onClick={() => { setMostrarForm(false); reset() }}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {materiales.length === 0 && !mostrarForm && (
        <p className="text-sm text-gray-400">Sin materiales aún.</p>
      )}

      <ul className="space-y-2">
        {materiales.map((m) => (
          <li
            key={m.id}
            className="flex items-start justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span>{TIPO_ICONS[m.tipo ?? 'otro']}</span>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {m.nombre}
                </a>
              </div>
              {m.descripcion && (
                <p className="mt-0.5 text-xs text-gray-500">{m.descripcion}</p>
              )}
            </div>
            <button
              onClick={() => handleEliminar(m.id)}
              className="text-xs text-red-400 hover:text-red-600"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
