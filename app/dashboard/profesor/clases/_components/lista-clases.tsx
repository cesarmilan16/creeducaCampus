'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Clase } from '@/types'
import CrearClaseForm from './crear-clase-form'

export default function ListaClases({ clases }: { clases: Clase[] }) {
  const [mostrarForm, setMostrarForm] = useState(false)

  return (
    <div className="space-y-4">
      {/* Botón nueva clase */}
      {!mostrarForm && (
        <button
          onClick={() => setMostrarForm(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Nueva clase
        </button>
      )}

      {mostrarForm && (
        <CrearClaseForm onClose={() => setMostrarForm(false)} />
      )}

      {/* Lista de clases */}
      {clases.length === 0 ? (
        <p className="text-sm text-gray-500">
          Aún no tienes clases. ¡Crea la primera!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clases.map((clase) => (
            <Link
              key={clase.id}
              href={`/dashboard/profesor/clases/${clase.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <h3 className="font-semibold text-gray-900">{clase.nombre}</h3>
              {clase.descripcion && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {clase.descripcion}
                </p>
              )}
              {clase.horario && clase.horario.length > 0 && (
                <p className="mt-2 text-xs text-blue-600">
                  {clase.horario.length} franja
                  {clase.horario.length > 1 ? 's' : ''} horaria
                  {clase.horario.length > 1 ? 's' : ''}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
