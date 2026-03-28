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
      <div>
        <h1 className="text-2xl font-bold text-[#1B3557]">Mis Clases</h1>
        <p className="mt-0.5 text-sm text-gray-500">Clases en las que estás matriculado</p>
      </div>

      {clases.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E0D9] bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            No estás matriculado en ninguna clase todavía.
          </p>
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

              {clase.usuarios?.nombre && (
                <p className="text-xs text-gray-400">
                  Profesor:{' '}
                  <span className="font-medium text-gray-600">{clase.usuarios.nombre}</span>
                </p>
              )}

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
                href={`/dashboard/alumno/clases/${clase.id}`}
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
