'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Comunicado, Clase } from '@/types'
import {
  crearComunicadoAction,
  eliminarComunicadoAction,
} from '@/app/dashboard/profesor/comunicados/actions'

const schema = z.object({
  titulo: z.string().min(1, 'El título es obligatorio'),
  cuerpo: z.string().min(1, 'El contenido es obligatorio'),
  clase_id: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

type ComunicadoConClase = Comunicado & { clases: { nombre: string } | null }

export default function ComunicadosList({
  comunicados,
  clases,
}: {
  comunicados: ComunicadoConClase[]
  clases: Pick<Clase, 'id' | 'nombre'>[]
}) {
  const router = useRouter()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const result = await crearComunicadoAction(values)
    if ('error' in result) {
      setServerError(result.error)
    } else {
      reset()
      setMostrarForm(false)
      router.refresh()
    }
  }

  async function handleEliminar(id: string) {
    const result = await eliminarComunicadoAction(id)
    if ('error' in result) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      {!mostrarForm && (
        <button
          onClick={() => setMostrarForm(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Nuevo comunicado
        </button>
      )}

      {mostrarForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-4"
        >
          <h3 className="font-semibold text-gray-800">Nuevo comunicado</h3>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Título *</label>
            <input
              type="text"
              {...register('titulo')}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.titulo && (
              <p className="text-xs text-red-600">{errors.titulo.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Contenido *</label>
            <textarea
              rows={4}
              {...register('cuerpo')}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.cuerpo && (
              <p className="text-xs text-red-600">{errors.cuerpo.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Destinatarios</label>
            <select
              {...register('clase_id')}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Global (todos los alumnos)</option>
              {clases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
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
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </button>
            <button
              type="button"
              onClick={() => { setMostrarForm(false); reset() }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {comunicados.length === 0 ? (
        <p className="text-sm text-gray-400">Sin comunicados publicados.</p>
      ) : (
        <ul className="space-y-3">
          {comunicados.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{c.titulo}</h3>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {c.clases?.nombre ?? 'Global'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{c.cuerpo}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleEliminar(c.id)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
