'use client'

import { useState, useTransition } from 'react'
import type { Tarea, Entrega } from '@/types'

type TareaConEntrega = Tarea & {
  clases: { nombre: string } | null
  entrega: Entrega | null
}

type Props = {
  tareas: TareaConEntrega[]
  entregarAction: (data: {
    tarea_id: string
    respuesta: string
  }) => Promise<{ error: string } | { success: true }>
}

type Tab = 'pendiente' | 'entregado' | 'revisado'

const TABS: { key: Tab; label: string }[] = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'entregado', label: 'Entregados' },
  { key: 'revisado', label: 'Revisados' },
]

function getEstado(entrega: Entrega | null): Tab {
  if (!entrega) return 'pendiente'
  return entrega.estado
}

function isUrgente(fecha_entrega: string | null): boolean {
  if (!fecha_entrega) return false
  const diff = new Date(fecha_entrega).getTime() - Date.now()
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000
}

function isVencida(fecha_entrega: string | null): boolean {
  if (!fecha_entrega) return false
  return new Date(fecha_entrega).getTime() < Date.now()
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const CLASE_COLORS = [
  'bg-[#EBF0F7] text-[#1B3557]',
  'bg-violet-50 text-violet-700',
  'bg-rose-50 text-rose-700',
  'bg-teal-50 text-teal-700',
  'bg-orange-50 text-orange-700',
]

function claseColor(nombre: string): string {
  let hash = 0
  for (let i = 0; i < nombre.length; i++) {
    hash = (hash * 31 + nombre.charCodeAt(i)) % CLASE_COLORS.length
  }
  return CLASE_COLORS[Math.abs(hash) % CLASE_COLORS.length]
}

function TareaCard({
  tarea,
  entregarAction,
}: {
  tarea: TareaConEntrega
  entregarAction: Props['entregarAction']
}) {
  const estado = getEstado(tarea.entrega)
  const [expandida, setExpandida] = useState(false)
  const [respuesta, setRespuesta] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleEntregar() {
    if (!respuesta.trim()) {
      setError('Escribe tu respuesta antes de entregar.')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await entregarAction({ tarea_id: tarea.id, respuesta })
      if ('error' in result) {
        setError(result.error)
      } else {
        setExpandida(false)
        setRespuesta('')
      }
    })
  }

  const urgente = isUrgente(tarea.fecha_entrega)
  const vencida = isVencida(tarea.fecha_entrega)
  const claseNombre = tarea.clases?.nombre ?? 'Sin clase'

  return (
    <div className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-2">
        <span
          className={`rounded-lg px-2 py-0.5 text-xs font-medium ${claseColor(claseNombre)}`}
        >
          {claseNombre}
        </span>

        {estado === 'pendiente' && (
          <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
            Pendiente
          </span>
        )}
        {estado === 'entregado' && (
          <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
            Entregado
          </span>
        )}
        {estado === 'revisado' && (
          <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            Revisado
          </span>
        )}
      </div>

      <div>
        <h3 className="font-bold text-[#1B3557]">{tarea.titulo}</h3>
        {tarea.descripcion && (
          <p className="mt-1 text-sm text-gray-500">{tarea.descripcion}</p>
        )}
      </div>

      {/* Fecha de entrega */}
      {tarea.fecha_entrega && (
        <div className="flex items-center gap-1.5">
          <svg
            className={`h-4 w-4 flex-shrink-0 ${
              estado === 'pendiente' && vencida
                ? 'text-red-500'
                : urgente && estado === 'pendiente'
                ? 'text-amber-500'
                : 'text-gray-400'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span
            className={`text-xs font-medium ${
              estado === 'pendiente' && vencida
                ? 'text-red-600'
                : urgente && estado === 'pendiente'
                ? 'text-amber-600'
                : 'text-gray-500'
            }`}
          >
            {estado === 'pendiente' && vencida
              ? 'Vencida — '
              : urgente && estado === 'pendiente'
              ? 'Menos de 3 dias — '
              : 'Entrega: '}
            {formatFecha(tarea.fecha_entrega)}
          </span>
        </div>
      )}

      {/* Estado: Pendiente — formulario de entrega */}
      {estado === 'pendiente' && (
        <div className="space-y-2 pt-1">
          {!expandida ? (
            <button
              onClick={() => setExpandida(true)}
              className="rounded-xl bg-[#1B3557] px-4 py-2 text-sm font-medium text-white hover:bg-[#152840] transition-colors"
            >
              Entregar
            </button>
          ) : (
            <div className="space-y-2">
              <label
                htmlFor={`respuesta-${tarea.id}`}
                className="block text-xs font-medium text-gray-600"
              >
                Tu respuesta
              </label>
              <textarea
                id={`respuesta-${tarea.id}`}
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                rows={4}
                placeholder="Escribe tu respuesta aqui..."
                className="w-full rounded-xl border border-[#E5E0D9] bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#1B3557] focus:outline-none focus:ring-1 focus:ring-[#1B3557] resize-none"
              />
              {error && (
                <p className="text-xs text-red-600" role="alert">
                  {error}
                </p>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEntregar}
                  disabled={isPending}
                  className="rounded-xl bg-[#1B3557] px-4 py-2 text-sm font-medium text-white hover:bg-[#152840] transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Enviando...' : 'Confirmar entrega'}
                </button>
                <button
                  onClick={() => {
                    setExpandida(false)
                    setRespuesta('')
                    setError(null)
                  }}
                  className="rounded-xl border border-[#E5E0D9] px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estado: Entregado */}
      {estado === 'entregado' && tarea.entrega?.respuesta && (
        <div className="rounded-xl bg-gray-50 px-3 py-2.5">
          <p className="text-xs font-medium text-gray-400 mb-1">Tu respuesta</p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{tarea.entrega.respuesta}</p>
        </div>
      )}

      {/* Estado: Revisado */}
      {estado === 'revisado' && (
        <div className="space-y-2">
          {tarea.entrega?.nota !== null && tarea.entrega?.nota !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-emerald-600">
                {tarea.entrega.nota.toFixed(1)}
              </span>
              <span className="text-sm text-gray-400">/ 10</span>
            </div>
          )}
          {tarea.entrega?.comentario_profesor && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
              <p className="text-xs font-medium text-emerald-700 mb-1">Comentario del profesor</p>
              <p className="text-sm text-emerald-800 whitespace-pre-wrap">
                {tarea.entrega.comentario_profesor}
              </p>
            </div>
          )}
          {tarea.entrega?.respuesta && (
            <div className="rounded-xl bg-gray-50 px-3 py-2.5">
              <p className="text-xs font-medium text-gray-400 mb-1">Tu respuesta</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{tarea.entrega.respuesta}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState({ tab }: { tab: Tab }) {
  const messages: Record<Tab, string> = {
    pendiente: 'No tienes tareas pendientes.',
    entregado: 'No has entregado ningun ejercicio todavia.',
    revisado: 'Ningun ejercicio revisado todavia.',
  }
  return (
    <div className="rounded-2xl border border-[#E5E0D9] bg-white p-8 text-center shadow-sm">
      <p className="text-sm text-gray-500">{messages[tab]}</p>
    </div>
  )
}

export default function EjerciciosAlumnoPanel({ tareas, entregarAction }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('pendiente')

  const counts: Record<Tab, number> = {
    pendiente: tareas.filter((t) => getEstado(t.entrega) === 'pendiente').length,
    entregado: tareas.filter((t) => getEstado(t.entrega) === 'entregado').length,
    revisado: tareas.filter((t) => getEstado(t.entrega) === 'revisado').length,
  }

  const tareasFiltradas = tareas.filter((t) => getEstado(t.entrega) === activeTab)

  if (tareas.length === 0) {
    return (
      <div className="rounded-2xl border border-[#E5E0D9] bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-gray-500">No hay ejercicios asignados en tus clases.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div
        className="flex gap-1 rounded-2xl border border-[#E5E0D9] bg-white p-1.5 shadow-sm"
        role="tablist"
        aria-label="Filtrar ejercicios por estado"
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-[#1B3557] text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {label}
            {counts[key] > 0 && (
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                  activeTab === key
                    ? 'bg-white/20 text-white'
                    : key === 'pendiente'
                    ? 'bg-amber-100 text-amber-700'
                    : key === 'entregado'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista de tareas */}
      <div role="tabpanel" className="space-y-3">
        {tareasFiltradas.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          tareasFiltradas.map((tarea) => (
            <TareaCard key={tarea.id} tarea={tarea} entregarAction={entregarAction} />
          ))
        )}
      </div>
    </div>
  )
}
