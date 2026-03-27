'use client'

import { useState } from 'react'
import type { Clase } from '@/types'
import EditarClaseForm from './editar-clase-form'

export default function ClaseHeader({ clase }: { clase: Clase }) {
  const [editando, setEditando] = useState(false)

  if (editando) {
    return <EditarClaseForm clase={clase} onClose={() => setEditando(false)} />
  }

  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{clase.nombre}</h1>
        {clase.descripcion && (
          <p className="mt-1 text-gray-500">{clase.descripcion}</p>
        )}
      </div>
      <button
        onClick={() => setEditando(true)}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
      >
        Editar
      </button>
    </div>
  )
}
