import { createServerClient } from '@supabase/ssr'
import { createBrowserClient } from '@supabase/ssr'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Cliente para Server Components y Server Actions.
 * Lee y escribe cookies para mantener la sesión actualizada.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll puede lanzar en Server Components de solo lectura;
            // el middleware se encarga del refresco en esos casos.
          }
        },
      },
    }
  )
}

/**
 * Cliente para Client Components.
 * Singleton para evitar instancias duplicadas en el navegador.
 */
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return browserClient
}

/**
 * Cliente con service role para operaciones que requieren bypass de RLS.
 * ADVERTENCIA: solo server-side, NUNCA exponer al cliente.
 */
export function createSupabaseServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
