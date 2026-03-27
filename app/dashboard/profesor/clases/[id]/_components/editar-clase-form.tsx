'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Clase } from '@/types'
import { editarClaseAction } from '@/app/dashboard/profesor/clases/[id]/actions'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const schema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  descripcion: z.string().optional(),
  horario: z.array(
    z.object({
      dia: z.string().min(1, 'Selecciona un día'),
      hora_inicio: z.string().min(1, 'Hora inicio requerida'),
      hora_fin: z.string().min(1, 'Hora fin requerida'),
    })
  ),
})

type FormValues = z.infer<typeof schema>

export default function EditarClaseForm({
  clase,
  onClose,
}: {
  clase: Clase
  onClose: () => void
}) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: clase.nombre,
      descripcion: clase.descripcion ?? '',
      horario: clase.horario ?? [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'horario',
  })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const result = await editarClaseAction(clase.id, values)
    if ('error' in result) {
      setServerError(result.error)
    } else {
      router.refresh()
      onClose()
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-4"
    >
      <h3 className="font-semibold text-gray-800">Editar clase</h3>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Nombre *</label>
        <input
          type="text"
          {...register('nombre')}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.nombre && (
          <p className="text-xs text-red-600">{errors.nombre.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          {...register('descripcion')}
          rows={2}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Horario */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Horario</label>
          <button
            type="button"
            onClick={() => append({ dia: '', hora_inicio: '', hora_fin: '' })}
            className="text-xs text-blue-600 hover:underline"
          >
            + Añadir franja
          </button>
        </div>

        {fields.length === 0 && (
          <p className="mt-1 text-xs text-gray-400">Sin franjas horarias</p>
        )}

        <div className="mt-2 space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <select
                {...register(`horario.${index}.dia`)}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Día</option>
                {DIAS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <input
                type="time"
                {...register(`horario.${index}.hora_inicio`)}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400 text-sm">–</span>
              <input
                type="time"
                {...register(`horario.${index}.hora_fin`)}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {serverError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
