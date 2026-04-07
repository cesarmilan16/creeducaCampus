'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import type { Tarea } from '@/types'

const schema = z.object({
  clase_id: z.string().min(1, 'Selecciona una clase'),
  titulo: z.string().min(1, 'El título es obligatorio'),
  descripcion: z.string().optional(),
  fecha_entrega: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

type TareaConClase = Tarea & {
  clases: { nombre: string } | null
  entregas_count: number
}

interface Props {
  clases: { id: string; nombre: string }[]
  tareas: TareaConClase[]
  crearTareaAction: (data: {
    clase_id: string
    titulo: string
    descripcion?: string
    fecha_entrega?: string
  }) => Promise<{ error: string } | { tarea: Tarea }>
  eliminarTareaAction: (id: string) => Promise<{ error: string } | { success: true }>
}

export default function EjerciciosProfesorPanel({
  clases,
  tareas,
  crearTareaAction,
  eliminarTareaAction,
}: Props) {
  const router = useRouter()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [eliminando, setEliminando] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const result = await crearTareaAction({
      clase_id: values.clase_id,
      titulo: values.titulo,
      descripcion: values.descripcion || undefined,
      fecha_entrega: values.fecha_entrega || undefined,
    })
    if ('error' in result) {
      setServerError(result.error)
    } else {
      reset()
      setMostrarForm(false)
      router.refresh()
    }
  }

  async function handleEliminar(id: string) {
    setEliminando(id)
    const result = await eliminarTareaAction(id)
    setEliminando(null)
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
          + Nueva tarea
        </button>
      )}

      {mostrarForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-sm space-y-4"
        >
          <h3 className="font-semibold text-[#1B3557]">Nueva tarea</h3>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Clase <span aria-hidden="true">*</span>
            </label>
            <select
              {...register('clase_id')}
              className="rounded-xl border border-[#E5E0D9] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
            >
              <option value="">Selecciona una clase</option>
              {clases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            {errors.clase_id && (
              <p className="text-xs text-red-600">{errors.clase_id.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Título <span aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Ejercicio de gramática tema 3"
              {...register('titulo')}
              className="rounded-xl border border-[#E5E0D9] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
            />
            {errors.titulo && (
              <p className="text-xs text-red-600">{errors.titulo.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Descripcion / Enunciado
            </label>
            <textarea
              rows={4}
              placeholder="Describe el ejercicio, instrucciones, recursos..."
              {...register('descripcion')}
              className="rounded-xl border border-[#E5E0D9] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Fecha de entrega
            </label>
            <input
              type="date"
              {...register('fecha_entrega')}
              className="rounded-xl border border-[#E5E0D9] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
            />
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
              {isSubmitting ? 'Creando...' : 'Crear tarea'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMostrarForm(false)
                reset()
                setServerError(null)
              }}
              className="rounded-xl border border-[#E5E0D9] px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {tareas.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E0D9] bg-white p-12 text-center shadow-sm">
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF0F7]"
            aria-hidden="true"
          >
            <svg
              className="h-6 w-6 text-[#1B3557]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="font-medium text-[#1B3557]">Sin tareas creadas</p>
          <p className="mt-1 text-sm text-gray-400">
            Pulsa &ldquo;+ Nueva tarea&rdquo; para crear la primera.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tareas.map((tarea) => (
            <li
              key={tarea.id}
              className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/dashboard/profesor/ejercicios/${tarea.id}`}
                      className="font-semibold text-[#1B3557] hover:underline"
                    >
                      {tarea.titulo}
                    </Link>
                    {tarea.clases && (
                      <span className="rounded-lg bg-[#EBF0F7] px-2 py-0.5 text-xs font-medium text-[#1B3557]">
                        {tarea.clases.nombre}
                      </span>
                    )}
                    <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {tarea.entregas_count}{' '}
                      {tarea.entregas_count === 1 ? 'entrega' : 'entregas'}
                    </span>
                  </div>

                  {tarea.descripcion && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">
                      {tarea.descripcion}
                    </p>
                  )}

                  {tarea.fecha_entrega && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                      <svg
                        className="h-3.5 w-3.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <time dateTime={tarea.fecha_entrega}>
                        Entrega:{' '}
                        {new Date(tarea.fecha_entrega).toLocaleDateString(
                          'es-ES',
                          {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }
                        )}
                      </time>
                    </div>
                  )}
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  <Link
                    href={`/dashboard/profesor/ejercicios/${tarea.id}`}
                    className="rounded-xl border border-[#1B3557]/30 bg-[#EBF0F7] px-3 py-1.5 text-xs font-semibold text-[#1B3557] hover:bg-[#d6e2f0] transition-colors"
                  >
                    Ver entregas
                  </Link>
                  <button
                    onClick={() => handleEliminar(tarea.id)}
                    disabled={eliminando === tarea.id}
                    aria-label={`Eliminar tarea ${tarea.titulo}`}
                    className="rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors"
                  >
                    {eliminando === tarea.id ? '...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
