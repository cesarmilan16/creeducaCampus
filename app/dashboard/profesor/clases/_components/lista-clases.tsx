'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Clase } from '@/types'
import CrearClaseForm from './crear-clase-form'

export default function ListaClases({ clases }: { clases: Clase[] }) {
  const [mostrarForm, setMostrarForm] = useState(false)

  return (
    <div className="space-y-4">
      {!mostrarForm && (
        <button
          onClick={() => setMostrarForm(true)}
          className="rounded-xl bg-[#1B3557] px-4 py-2 text-sm font-semibold text-white hover:bg-[#152840] transition-colors"
        >
          + Nueva clase
        </button>
      )}

      {mostrarForm && (
        <CrearClaseForm onClose={() => setMostrarForm(false)} />
      )}

      {clases.length === 0 && !mostrarForm ? (
        <div className="rounded-2xl border border-[#E5E0D9] bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">Aún no tienes clases. ¡Crea la primera!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clases.map((clase) => (
            <div
              key={clase.id}
              className="rounded-2xl border border-[#E5E0D9] bg-white p-5 shadow-sm flex flex-col gap-3"
            >
              <div>
                <h3 className="font-semibold text-[#1B3557]">{clase.nombre}</h3>
                {clase.descripcion && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {clase.descripcion}
                  </p>
                )}
              </div>

              {clase.horario && clase.horario.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {clase.horario.map((slot, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-[#EBF0F7] px-3 py-1 text-xs font-medium text-[#1B3557]"
                    >
                      <svg className="h-3 w-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      {slot.dia} {slot.hora_inicio}–{slot.hora_fin}
                    </span>
                  ))}
                </div>
              )}

              <Link
                href={`/dashboard/profesor/clases/${clase.id}`}
                className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[#1B3557] hover:underline"
              >
                Ver clase
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
