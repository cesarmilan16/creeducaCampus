import { createSupabaseServerClient } from '@/lib/supabase'

export default async function ProfesorDashboard() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [clasesRes, mensajesRes, comunicadosRes] = await Promise.all([
    supabase.from('clases').select('id, nombre').eq('profesor_id', user!.id),
    supabase
      .from('mensajes')
      .select('id', { count: 'exact', head: true })
      .eq('para_usuario', user!.id)
      .eq('leido', false),
    supabase
      .from('comunicados')
      .select('id, titulo, created_at')
      .eq('autor_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const clases = clasesRes.data ?? []
  const mensajesNoLeidos = mensajesRes.count ?? 0
  const comunicados = comunicadosRes.data ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Panel del Profesor</h1>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Clases activas</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">{clases.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Mensajes sin leer</p>
          <p className="mt-1 text-3xl font-bold text-red-500">{mensajesNoLeidos}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Comunicados publicados</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{comunicados.length}</p>
        </div>
      </div>

      {/* Últimos comunicados */}
      {comunicados.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-800">Últimos comunicados</h2>
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

      {/* Mis clases */}
      {clases.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-800">Mis clases</h2>
          <ul className="space-y-1">
            {clases.map((c) => (
              <li key={c.id}>
                <a
                  href={`/dashboard/profesor/clases/${c.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {c.nombre}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
