'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import type { Tarea, Entrega, EstadoEntrega } from '@/types'

// El input HTML tipo "number" llega como string; transform lo convierte a number
// para que sea compatible con FieldValues de react-hook-form.
const calificarSchema = z.object({
  nota: z
    .string()
    .min(1, 'La nota es obligatoria')
    .transform((v) => parseFloat(v))
    .pipe(
      z
        .number()
        .min(0, 'La nota mínima es 0')
        .max(10, 'La nota máxima es 10')
    ),
  comentario_profesor: z.string().optional(),
})

type CalificarInput = z.input<typeof calificarSchema>
type CalificarOutput = z.output<typeof calificarSchema>

type TareaConClase = Tarea & { clases: { nombre: string } | null }
type EntregaConAlumno = Entrega & { usuarios: { nombre: string } | null }

interface Props {
  tarea: TareaConClase
  entregas: EntregaConAlumno[]
  calificarEntregaAction: (data: {
    entrega_id: string
    nota: number
    comentario_profesor?: string
  }) => Promise<{ error: string } | { success: true }>
}

function badgeEstado(estado: EstadoEntrega) {
  switch (estado) {
    case 'pendiente':
      return (
        <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
          Pendiente
        </span>
      )
    case 'entregado':
      return (
        <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
          Entregado
        </span>
      )
    case 'revisado':
      return (
        <span className="rounded-lg bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
          Revisado
        </span>
      )
  }
}

interface CalificarFormProps {
  entregaId: string
  calificarEntregaAction: Props['calificarEntregaAction']
  onDone: () => void
}

function CalificarForm({ entregaId, calificarEntregaAction, onDone }: CalificarFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CalificarInput, unknown, CalificarOutput>({
    resolver: zodResolver(calificarSchema),
  })

  async function onSubmit(values: CalificarOutput) {
    setServerError(null)
    const result = await calificarEntregaAction({
      entrega_id: entregaId,
      nota: values.nota,
      comentario_profesor: values.comentario_profesor || undefined,
    })
    if ('error' in result) {
      setServerError(result.error)
    } else {
      onDone()
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-3 rounded-xl border border-[#E5E0D9] bg-[#F2EDE7] p-4 space-y-3"
    >
      <p className="text-xs font-semibold text-[#1B3557]">Calificar entrega</p>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-700">
            Nota (0&ndash;10) <span aria-hidden="true">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min={0}
            max={10}
            {...register('nota')}
            className="w-24 rounded-xl border border-[#E5E0D9] bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
          />
          {errors.nota && (
            <p className="text-xs text-red-600">{errors.nota.message}</p>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 min-w-48">
          <label className="text-xs font-medium text-gray-700">
            Comentario (opcional)
          </label>
          <input
            type="text"
            placeholder="Buen trabajo, pero..."
            {...register('comentario_profesor')}
            className="rounded-xl border border-[#E5E0D9] bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
          />
        </div>
      </div>

      {serverError && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
          {serverError}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-[#1B3557] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#152840] disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar nota'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-xl border border-[#E5E0D9] bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function EntregasPanel({
  tarea,
  entregas,
  calificarEntregaAction,
}: Props) {
  const router = useRouter()
  const [calificandoId, setCalificandoId] = useState<string | null>(null)

  const totalEntregadas = entregas.filter(
    (e) => e.estado === 'entregado' || e.estado === 'revisado'
  ).length

  function handleDone() {
    setCalificandoId(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Header breadcrumb + titulo */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link
            href="/dashboard/profesor/ejercicios"
            className="hover:text-[#1B3557] transition-colors"
          >
            Ejercicios
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-700">{tarea.titulo}</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1B3557]">{tarea.titulo}</h1>
        {tarea.clases && (
          <span className="mt-1 inline-block rounded-lg bg-[#EBF0F7] px-2 py-0.5 text-xs font-medium text-[#1B3557]">
            {tarea.clases.nombre}
          </span>
        )}
      </div>

      {/* Info de la tarea */}
      <div className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-sm space-y-3">
        {tarea.descripcion ? (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Enunciado</p>
            <p className="whitespace-pre-wrap text-sm text-gray-600">
              {tarea.descripcion}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">Sin descripcion.</p>
        )}

        {tarea.fecha_entrega && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg
              className="h-4 w-4 flex-shrink-0"
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
            <span>
              Fecha limite:{' '}
              <time dateTime={tarea.fecha_entrega}>
                {new Date(tarea.fecha_entrega + 'T00:00:00').toLocaleDateString(
                  'es-ES',
                  { day: 'numeric', month: 'long', year: 'numeric' }
                )}
              </time>
            </span>
          </div>
        )}
      </div>

      {/* Lista de entregas */}
      <div className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#1B3557]">Entregas</h2>
          <span className="rounded-xl bg-[#EBF0F7] px-3 py-1 text-sm font-semibold text-[#1B3557]">
            {totalEntregadas} / {entregas.length} entregado
          </span>
        </div>

        {entregas.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-400">
              Aun no hay entregas de alumnos.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#E5E0D9]" role="list">
            {entregas.map((entrega) => (
              <li key={entrega.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-[#1B3557]">
                        {entrega.usuarios?.nombre ?? 'Alumno desconocido'}
                      </span>
                      {badgeEstado(entrega.estado)}
                      {entrega.estado === 'revisado' && entrega.nota !== null && (
                        <span className="rounded-lg bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700">
                          {entrega.nota} / 10
                        </span>
                      )}
                    </div>

                    {entrega.respuesta && (
                      <div className="mt-2 rounded-xl border border-[#E5E0D9] bg-[#F2EDE7] px-3 py-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Respuesta del alumno
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {entrega.respuesta}
                        </p>
                      </div>
                    )}

                    {entrega.estado === 'revisado' && entrega.comentario_profesor && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500">
                          Tu comentario:{' '}
                          <span className="font-normal text-gray-600">
                            {entrega.comentario_profesor}
                          </span>
                        </p>
                      </div>
                    )}

                    {calificandoId === entrega.id && (
                      <CalificarForm
                        entregaId={entrega.id}
                        calificarEntregaAction={calificarEntregaAction}
                        onDone={handleDone}
                      />
                    )}
                  </div>

                  {entrega.estado === 'entregado' &&
                    calificandoId !== entrega.id && (
                      <button
                        onClick={() => setCalificandoId(entrega.id)}
                        className="flex-shrink-0 rounded-xl bg-[#1B3557] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#152840] transition-colors"
                      >
                        Calificar
                      </button>
                    )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
