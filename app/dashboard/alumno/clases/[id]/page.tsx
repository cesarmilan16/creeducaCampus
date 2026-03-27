import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase'
import type { Material, Nota } from '@/types'

const TIPO_ICONS: Record<string, string> = {
  enlace: '🔗',
  video: '🎥',
  documento: '📄',
  otro: '📎',
}

export default async function ClaseAlumnoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [claseRes, materialesRes, notasRes] = await Promise.all([
    supabase
      .from('clases')
      .select('*, usuarios!clases_profesor_id_fkey(nombre)')
      .eq('id', id)
      .single(),
    supabase
      .from('materiales')
      .select('*')
      .eq('clase_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('notas')
      .select('*')
      .eq('clase_id', id)
      .eq('alumno_id', user!.id),
  ])

  if (claseRes.error || !claseRes.data) notFound()

  const clase = claseRes.data as {
    id: string
    nombre: string
    descripcion: string | null
    horario: { dia: string; hora_inicio: string; hora_fin: string }[] | null
    usuarios: { nombre: string } | null
  }
  const materiales = (materialesRes.data as Material[]) ?? []
  const notas = (notasRes.data as Nota[]) ?? []

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/dashboard/alumno/clases" className="hover:underline">
          Mis Clases
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{clase.nombre}</span>
      </nav>

      {/* Info clase */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{clase.nombre}</h1>
        {clase.descripcion && (
          <p className="mt-1 text-gray-500">{clase.descripcion}</p>
        )}
        {clase.usuarios?.nombre && (
          <p className="mt-1 text-sm text-gray-400">
            Profesor: {clase.usuarios.nombre}
          </p>
        )}
      </div>

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
        <h2 className="mb-3 font-semibold text-gray-800">Materiales</h2>
        {materiales.length === 0 ? (
          <p className="text-sm text-gray-400">Sin materiales disponibles.</p>
        ) : (
          <ul className="space-y-2">
            {materiales.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span>{TIPO_ICONS[m.tipo ?? 'otro']}</span>
                  <div>
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {m.nombre}
                    </a>
                    {m.descripcion && (
                      <p className="text-xs text-gray-400">{m.descripcion}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mis notas */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-gray-800">Mis Notas</h2>
        {notas.length === 0 ? (
          <p className="text-sm text-gray-400">Sin notas registradas aún.</p>
        ) : (
          <ul className="space-y-2">
            {notas.map((n) => (
              <li key={n.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {n.comentario ?? 'Nota'}
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {n.valor}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
