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
          className="rounded-xl bg-[#1B3557] px-4 py-2 text-sm font-semibold text-white hover:bg-[#152840] transition-colors"
        >
          + Nuevo comunicado
        </button>
      )}

      {mostrarForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-sm space-y-4"
        >
          <h3 className="font-semibold text-[#1B3557]">Nuevo comunicado</h3>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Título *</label>
            <input
              type="text"
              {...register('titulo')}
              className="rounded-xl border border-[#E5E0D9] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
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
              className="rounded-xl border border-[#E5E0D9] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
            />
            {errors.cuerpo && (
              <p className="text-xs text-red-600">{errors.cuerpo.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Destinatarios</label>
            <select
              {...register('clase_id')}
              className="rounded-xl border border-[#E5E0D9] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
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
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#1B3557] px-4 py-2 text-sm font-semibold text-white hover:bg-[#152840] disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </button>
            <button
              type="button"
              onClick={() => { setMostrarForm(false); reset() }}
              className="rounded-xl border border-[#E5E0D9] px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {comunicados.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E0D9] bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-400">Sin comunicados publicados.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {comunicados.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-[#1B3557]">{c.titulo}</h3>
                    <span
                      className={`rounded-lg px-2 py-0.5 text-xs font-medium ${
                        c.clases
                          ? 'bg-[#EBF0F7] text-[#1B3557]'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
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
                  className="flex-shrink-0 rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
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
