import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Rol } from '@/types'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Usar getUser() (no getSession()) para verificación segura server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isProtected = pathname.startsWith('/dashboard')
  const isAuthRoute =
    pathname.startsWith('/login') || pathname.startsWith('/registro')

  // Sin sesión en ruta protegida → redirect /login
  if (!user && isProtected) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Con sesión en rutas de auth → redirect al dashboard correspondiente
  if (user && isAuthRoute) {
    const { data: usuarioData } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .maybeSingle<{ rol: Rol }>()

    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = usuarioData?.rol
      ? `/dashboard/${usuarioData.rol}`
      : '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  // Con sesión en ruta protegida → verificar que el rol coincide
  if (user && isProtected) {
    const { data: usuarioData } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .maybeSingle<{ rol: Rol }>()

    if (!usuarioData?.rol) {
      return supabaseResponse
    }

    const rol: Rol = usuarioData.rol

    const enRutaProfesor = pathname.startsWith('/dashboard/profesor')
    const enRutaAlumno = pathname.startsWith('/dashboard/alumno')

    if (enRutaProfesor && rol === 'alumno') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard/alumno'
      return NextResponse.redirect(redirectUrl)
    }

    if (enRutaAlumno && rol === 'profesor') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard/profesor'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Siempre retornar el response con cookies actualizadas (refresco de sesión)
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - _next/static (archivos estáticos de Next.js)
     * - _next/image (optimización de imágenes de Next.js)
     * - favicon.ico
     * - Archivos con extensión (imágenes, fuentes, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
