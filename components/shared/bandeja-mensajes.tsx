'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Mensaje, Usuario } from '@/types'
import NuevoMensajeForm from './nuevo-mensaje-form'

const PAGE_SIZE = 10

type MensajeConUsuario = Mensaje & {
  otros_usuarios: { nombre: string } | null
}

type EnviarAction = (data: {
  para_usuario: string
  asunto?: string
  cuerpo: string
}) => Promise<{ error: string } | { success: true }>

type MarcarLeidoAction = (id: string) => Promise<{ error: string } | { success: true }>

export default function BandejaMensajes({
  recibidos,
  enviados,
  usuarios,
  enviarAction,
  marcarLeidoAction,
}: {
  recibidos: MensajeConUsuario[]
  enviados: MensajeConUsuario[]
  usuarios: Pick<Usuario, 'id' | 'nombre'>[]
  enviarAction: EnviarAction
  marcarLeidoAction: MarcarLeidoAction
}) {
  const router = useRouter()
  const [tab, setTab] = useState<'recibidos' | 'enviados'>('recibidos')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [page, setPage] = useState(1)

  const mensajes = tab === 'recibidos' ? recibidos : enviados
  const totalPages = Math.max(1, Math.ceil(mensajes.length / PAGE_SIZE))
  const paginados = mensajes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const selected = mensajes.find((m) => m.id === selectedId) ?? null

  function handleTabChange(t: 'recibidos' | 'enviados') {
    setTab(t)
    setSelectedId(null)
    setPage(1)
  }

  async function handleOpen(m: MensajeConUsuario) {
    setSelectedId(m.id)
    if (tab === 'recibidos' && !m.leido) {
      await marcarLeidoAction(m.id)
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      {/* Botón nuevo mensaje */}
      {!mostrarForm && (
        <button
          onClick={() => setMostrarForm(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Nuevo mensaje
        </button>
      )}

      {mostrarForm && (
        <NuevoMensajeForm
          usuarios={usuarios}
          enviarAction={enviarAction}
          onClose={() => setMostrarForm(false)}
        />
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(['recibidos', 'enviados'] as const).map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
            {t === 'recibidos' && recibidos.filter((m) => !m.leido).length > 0 && (
              <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                {recibidos.filter((m) => !m.leido).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Lista con paginación */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-1">
          {mensajes.length === 0 && (
            <p className="text-sm text-gray-400 py-2">Sin mensajes.</p>
          )}
          <ul className="space-y-1">
            {paginados.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => handleOpen(m)}
                  className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                    selectedId === m.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${!m.leido && tab === 'recibidos' ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {m.otros_usuarios?.nombre ?? '—'}
                    </p>
                    {!m.leido && tab === 'recibidos' && (
                      <span className="ml-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                    )}
                  </div>
                  {m.asunto && (
                    <p className="truncate text-xs text-gray-400">{m.asunto}</p>
                  )}
                  <p className="text-xs text-gray-300 mt-0.5">
                    {new Date(m.created_at).toLocaleDateString('es-ES')}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Ant.
              </button>
              <span className="text-xs text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Sig. →
              </button>
            </div>
          )}
        </div>

        {/* Detalle */}
        {selected ? (
          <div className="flex-1 rounded-xl border border-gray-200 bg-white p-5">
            {selected.asunto && (
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {selected.asunto}
              </h3>
            )}
            <p className="text-xs text-gray-400 mb-4">
              {tab === 'recibidos' ? 'De' : 'Para'}: {selected.otros_usuarios?.nombre ?? '—'} ·{' '}
              {new Date(selected.created_at).toLocaleString('es-ES')}
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.cuerpo}</p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
            Selecciona un mensaje
          </div>
        )}
      </div>
    </div>
  )
}
