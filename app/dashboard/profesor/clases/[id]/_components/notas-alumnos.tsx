'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Nota, Usuario } from '@/types'
import { upsertNotaAction } from '@/app/dashboard/profesor/clases/[id]/actions'

const schema = z.object({
  valor: z.number({ message: 'Introduce un numero' }).min(0, 'Minimo 0').max(10, 'Maximo 10'),
  comentario: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface AlumnoConNota {
  alumno: Pick<Usuario, 'id' | 'nombre' | 'email'>
  nota: Nota | null
}

function NotaForm({
  alumno,
  nota,
  claseId,
  onClose,
}: {
  alumno: Pick<Usuario, 'id' | 'nombre'>
  nota: Nota | null
  claseId: string
  onClose: () => void
}) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      valor: nota?.valor ?? undefined,
      comentario: nota?.comentario ?? '',
    },
  })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const result = await upsertNotaAction({
      alumno_id: alumno.id,
      clase_id: claseId,
      valor: values.valor,
      comentario: values.comentario,
    })
    if ('error' in result) {
      setServerError(result.error)
    } else {
      router.refresh()
      onClose()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-3 rounded-xl border border-[#E5E0D9] bg-[#F2EDE7] p-3 space-y-3">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-700">Nota (0–10) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            {...register('valor', { valueAsNumber: true })}
            className="w-24 rounded-xl border border-[#E5E0D9] bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
          />
          {errors.valor && (
            <p className="text-xs text-red-600">{errors.valor.message}</p>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 min-w-48">
          <label className="text-xs font-medium text-gray-700">Comentario</label>
          <input
            type="text"
            placeholder="Muy buen trabajo en..."
            {...register('comentario')}
            className="rounded-xl border border-[#E5E0D9] bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3557]"
          />
        </div>
      </div>
      {serverError && (
        <p className="rounded-xl bg-red-50 px-3 py-1.5 text-xs text-red-700">{serverError}</p>
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
          onClick={onClose}
          className="rounded-xl border border-[#E5E0D9] px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function NotasAlumnos({
  alumnos,
  claseId,
}: {
  alumnos: AlumnoConNota[]
  claseId: string
}) {
  const [editandoId, setEditandoId] = useState<string | null>(null)

  if (alumnos.length === 0) {
    return (
      <div>
        <h2 className="font-semibold text-[#1B3557]">Alumnos y Notas</h2>
        <p className="mt-2 text-sm text-gray-400">Sin alumnos matriculados aún.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-[#1B3557]">Alumnos y Notas</h2>
      <ul className="divide-y divide-[#E5E0D9]">
        {alumnos.map(({ alumno, nota }) => (
          <li key={alumno.id} className="py-3 first:pt-1 last:pb-0">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#1B3557]">{alumno.nombre}</p>
                <p className="text-xs text-gray-400">{alumno.email}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  {nota?.valor !== null && nota?.valor !== undefined ? (
                    <span className="text-xl font-bold text-emerald-600">{nota.valor}</span>
                  ) : (
                    <span className="text-sm text-gray-400">Sin nota</span>
                  )}
                  {nota?.comentario && (
                    <p className="text-xs text-gray-400 max-w-48 truncate">{nota.comentario}</p>
                  )}
                </div>
                <button
                  onClick={() =>
                    setEditandoId(editandoId === alumno.id ? null : alumno.id)
                  }
                  className="rounded-xl border border-[#E5E0D9] px-2.5 py-1 text-xs font-medium text-[#1B3557] hover:bg-[#EBF0F7] transition-colors"
                >
                  {nota ? 'Editar' : 'Añadir nota'}
                </button>
              </div>
            </div>

            {editandoId === alumno.id && (
              <NotaForm
                alumno={alumno}
                nota={nota}
                claseId={claseId}
                onClose={() => setEditandoId(null)}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
