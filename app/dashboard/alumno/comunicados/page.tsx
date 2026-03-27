import { createSupabaseServerClient } from '@/lib/supabase'

type ComunicadoRow = {
  id: string
  titulo: string
  cuerpo: string
  created_at: string
  clase_id: string | null
  clases: { nombre: string } | { nombre: string }[] | null
  usuarios: { nombre: string } | { nombre: string }[] | null
}

export default async function ComunicadosAlumnoPage() {
  const supabase = await createSupabaseServerClient()

  const { data: comunicados } = await supabase
    .from('comunicados')
    .select(
      'id, titulo, cuerpo, created_at, clase_id, clases(nombre), usuarios!comunicados_autor_id_fkey(nombre)'
    )
    .order('created_at', { ascending: false })

  const rows = ((comunicados as ComunicadoRow[] | null) ?? []).map((comunicado) => ({
    ...comunicado,
    clases: Array.isArray(comunicado.clases)
      ? (comunicado.clases[0] ?? null)
      : comunicado.clases,
    usuarios: Array.isArray(comunicado.usuarios)
      ? (comunicado.usuarios[0] ?? null)
      : comunicado.usuarios,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Comunicados</h1>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-400">Sin comunicados por ahora.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{c.titulo}</h3>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {c.clases?.nombre ?? 'Global'}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{c.cuerpo}</p>
              <p className="mt-2 text-xs text-gray-400">
                {c.usuarios?.nombre && `Por ${c.usuarios.nombre} · `}
                {new Date(c.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
