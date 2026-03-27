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
    <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600">Nota (0-10)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            {...register('valor', { valueAsNumber: true })}
            className="w-24 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.valor && (
            <p className="text-xs text-red-600">{errors.valor.message}</p>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs text-gray-600">Comentario</label>
          <input
            type="text"
            {...register('comentario')}
            className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      {serverError && <p className="text-xs text-red-600">{serverError}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar nota'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-gray-500 hover:underline"
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
        <h2 className="font-semibold text-gray-800">Alumnos y Notas</h2>
        <p className="mt-2 text-sm text-gray-400">Sin alumnos matriculados aun.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-gray-800">Alumnos y Notas</h2>
      <ul className="space-y-2">
        {alumnos.map(({ alumno, nota }) => (
          <li
            key={alumno.id}
            className="rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{alumno.nombre}</p>
                <p className="text-xs text-gray-400">{alumno.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  {nota?.valor !== null && nota?.valor !== undefined ? (
                    <span className="text-lg font-bold text-blue-600">{nota.valor}</span>
                  ) : (
                    <span className="text-sm text-gray-400">Sin nota</span>
                  )}
                  {nota?.comentario && (
                    <p className="text-xs text-gray-400">{nota.comentario}</p>
                  )}
                </div>
                <button
                  onClick={() =>
                    setEditandoId(editandoId === alumno.id ? null : alumno.id)
                  }
                  className="text-xs text-blue-500 hover:underline"
                >
                  {nota ? 'Editar' : 'Anadir nota'}
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
