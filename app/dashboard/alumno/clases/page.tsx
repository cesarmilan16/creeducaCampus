import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase'

type ClaseMatriculaRow = {
  clase_id: string
  clases:
    | {
        id: string
        nombre: string
        descripcion: string | null
        horario: { dia: string; hora_inicio: string; hora_fin: string }[] | null
        usuarios: { nombre: string } | { nombre: string }[] | null
      }
    | {
        id: string
        nombre: string
        descripcion: string | null
        horario: { dia: string; hora_inicio: string; hora_fin: string }[] | null
        usuarios: { nombre: string } | { nombre: string }[] | null
      }[]
    | null
}

export default async function ClasesAlumnoPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: matriculas } = await supabase
    .from('matriculas')
    .select(
      'clase_id, clases(id, nombre, descripcion, horario, usuarios!clases_profesor_id_fkey(nombre))'
    )
    .eq('alumno_id', user!.id)

  const clases = ((matriculas as ClaseMatriculaRow[] | null) ?? [])
    .map((m) => {
      const clase = Array.isArray(m.clases) ? m.clases[0] : m.clases
      if (!clase) return null

      const profesor = Array.isArray(clase.usuarios)
        ? (clase.usuarios[0] ?? null)
        : clase.usuarios

      return {
        ...clase,
        usuarios: profesor,
      }
    })
    .filter(
      (
        clase
      ): clase is {
        id: string
        nombre: string
        descripcion: string | null
        horario: { dia: string; hora_inicio: string; hora_fin: string }[] | null
        usuarios: { nombre: string } | null
      } => clase !== null
    )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mis Clases</h1>

      {clases.length === 0 ? (
        <p className="text-sm text-gray-500">
          No estás matriculado en ninguna clase todavía.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clases.map((clase) => (
            <Link
              key={clase.id}
              href={`/dashboard/alumno/clases/${clase.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <h3 className="font-semibold text-gray-900">{clase.nombre}</h3>
              {clase.descripcion && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {clase.descripcion}
                </p>
              )}
              {clase.usuarios?.nombre && (
                <p className="mt-2 text-xs text-gray-400">
                  Profesor: {clase.usuarios.nombre}
                </p>
              )}
              {clase.horario && clase.horario.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {clase.horario.map((slot, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600"
                    >
                      {slot.dia} {slot.hora_inicio}–{slot.hora_fin}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
