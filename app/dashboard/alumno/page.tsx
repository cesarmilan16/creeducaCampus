import { createSupabaseServerClient } from '@/lib/supabase'

export default async function AlumnoDashboard() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [matriculasRes, mensajesRes, comunicadosRes, notasRes] =
    await Promise.all([
      supabase
        .from('matriculas')
        .select('clase_id, clases(nombre)')
        .eq('alumno_id', user!.id),
      supabase
        .from('mensajes')
        .select('id', { count: 'exact', head: true })
        .eq('para_usuario', user!.id)
        .eq('leido', false),
      supabase
        .from('comunicados')
        .select('id, titulo, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('notas')
        .select('valor')
        .eq('alumno_id', user!.id)
        .not('valor', 'is', null),
    ])

  const matriculas = matriculasRes.data ?? []
  const mensajesNoLeidos = mensajesRes.count ?? 0
  const comunicados = comunicadosRes.data ?? []
  const notas = notasRes.data ?? []

  const promedio =
    notas.length > 0
      ? (notas.reduce((acc, n) => acc + (n.valor ?? 0), 0) / notas.length).toFixed(2)
      : null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mi Panel</h1>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Clases matriculadas</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">{matriculas.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Mensajes sin leer</p>
          <p className="mt-1 text-3xl font-bold text-red-500">{mensajesNoLeidos}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Promedio de notas</p>
          <p className="mt-1 text-3xl font-bold text-green-600">
            {promedio !== null ? promedio : '—'}
          </p>
        </div>
      </div>

      {/* Últimos comunicados */}
      {comunicados.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-800">Comunicados recientes</h2>
          <ul className="space-y-2">
            {comunicados.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{c.titulo}</span>
                <span className="text-xs text-gray-400">
                  {new Date(c.created_at).toLocaleDateString('es-ES')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
