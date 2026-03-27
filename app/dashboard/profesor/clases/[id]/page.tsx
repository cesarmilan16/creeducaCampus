import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase'
import type { Clase, Material, Nota, Usuario } from '@/types'
import EditarClaseForm from './_components/editar-clase-form'
import ListaMateriales from './_components/lista-materiales'
import NotasAlumnos from './_components/notas-alumnos'

// Componente wrapper client para el form de editar (necesita estado)
import ClaseHeader from './_components/clase-header'

export default async function ClaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [claseRes, materialesRes, matriculasRes, notasRes] = await Promise.all([
    supabase
      .from('clases')
      .select('*')
      .eq('id', id)
      .eq('profesor_id', user!.id)
      .single<Clase>(),
    supabase
      .from('materiales')
      .select('*')
      .eq('clase_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('matriculas')
      .select('alumno_id, usuarios!matriculas_alumno_id_fkey(id, nombre, email)')
      .eq('clase_id', id),
    supabase
      .from('notas')
      .select('*')
      .eq('clase_id', id),
  ])

  if (claseRes.error || !claseRes.data) notFound()

  const clase = claseRes.data
  const materiales = (materialesRes.data as Material[]) ?? []
  const notas = (notasRes.data as Nota[]) ?? []

  // Mapear alumnos con sus notas
  const alumnosConNota = (matriculasRes.data ?? []).map((m) => {
    const alumno = m.usuarios as unknown as Pick<Usuario, 'id' | 'nombre' | 'email'>
    const nota = notas.find((n) => n.alumno_id === alumno.id) ?? null
    return { alumno, nota }
  })

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/dashboard/profesor/clases" className="hover:underline">
          Mis Clases
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{clase.nombre}</span>
      </nav>

      {/* Header con edición */}
      <ClaseHeader clase={clase} />

      {/* Horario */}
      {clase.horario && clase.horario.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-800">Horario</h2>
          <div className="flex flex-wrap gap-2">
            {clase.horario.map((slot, i) => (
              <span
                key={i}
                className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
              >
                {slot.dia} · {slot.hora_inicio} – {slot.hora_fin}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Materiales */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <ListaMateriales materiales={materiales} claseId={clase.id} />
      </div>

      {/* Alumnos y notas */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <NotasAlumnos alumnos={alumnosConNota} claseId={clase.id} />
      </div>
    </div>
  )
}
