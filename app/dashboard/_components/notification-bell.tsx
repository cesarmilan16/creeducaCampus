'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Rol } from '@/types'

type MensajeNotif = {
  id: string
  asunto: string | null
  cuerpo: string
  created_at: string
  remitente: string
}

type ComunicadoNotif = {
  id: string
  titulo: string
  created_at: string
}

type MarcarLeidoAction = (id: string) => Promise<void>

export default function NotificationBell({
  mensajes,
  comunicados,
  rol,
  marcarLeidoAction,
}: {
  mensajes: MensajeNotif[]
  comunicados: ComunicadoNotif[]
  rol: Rol
  marcarLeidoAction: MarcarLeidoAction
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const total = mensajes.length + comunicados.length

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleMensajeClick(id: string) {
    await marcarLeidoAction(id)
    setOpen(false)
    router.push(`/dashboard/${rol}/mensajes`)
    router.refresh()
  }

  function handleComunicadoClick() {
    setOpen(false)
    router.push(`/dashboard/${rol}/comunicados`)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        aria-label="Notificaciones"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {total > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {total > 9 ? '9+' : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-800">Notificaciones</p>
          </div>

          {total === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-400">
              Sin notificaciones nuevas
            </p>
          ) : (
            <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto">
              {mensajes.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => handleMensajeClick(m.id)}
                    className="w-full px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {m.asunto ?? 'Nuevo mensaje'} — {m.remitente}
                        </p>
                        <p className="truncate text-xs text-gray-400">{m.cuerpo}</p>
                        <p className="mt-0.5 text-xs text-gray-300">
                          {new Date(m.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
              {comunicados.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={handleComunicadoClick}
                    className="w-full px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800">{c.titulo}</p>
                        <p className="mt-0.5 text-xs text-gray-300">
                          Comunicado · {new Date(c.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
