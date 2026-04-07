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
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-[#1B3557]">{clase.nombre}</h1>
        {clase.descripcion && (
          <p className="mt-1.5 text-gray-500">{clase.descripcion}</p>
        )}
      </div>
      <button
        onClick={() => setEditando(true)}
        className="flex-shrink-0 rounded-xl border border-[#E5E0D9] px-3 py-1.5 text-sm font-medium text-[#1B3557] hover:bg-[#EBF0F7] transition-colors"
      >
        Editar
      </button>
    </div>
  )
}
