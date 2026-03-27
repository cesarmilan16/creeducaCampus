import Link from 'next/link'
import LoginForm from './_components/login-form'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2EDE7] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#E5E0D9] bg-white p-8 shadow-sm">
        {/* Logo */}
        <div className="mb-6 text-center">
          <p className="text-2xl font-bold tracking-tight">
            <span style={{ color: '#F59E0B' }}>C</span>
            <span style={{ color: '#EF4444' }}>R</span>
            <span style={{ color: '#3B82F6' }}>E</span>
            <span style={{ color: '#1B3557' }}> </span>
            <span style={{ color: '#F59E0B' }}>E</span>
            <span style={{ color: '#1B3557' }}>D</span>
            <span style={{ color: '#10B981' }}>U</span>
            <span style={{ color: '#3B82F6' }}>C</span>
            <span style={{ color: '#F59E0B' }}>A</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">Plataforma educativa</p>
          <p className="mt-4 text-base font-semibold text-[#1B3557]">Iniciar sesión</p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link
            href="/registro"
            className="font-medium text-[#1B3557] hover:underline"
          >
            Crear cuenta
          </Link>
        </p>

        {/* Demo info */}
        <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3">
          <p className="text-xs font-medium text-gray-500">Acceso de demostración</p>
          <p className="mt-1 text-xs text-gray-400">
            Usa las credenciales de tu cuenta de profesor o alumno para entrar.
          </p>
        </div>
      </div>
    </main>
  )
}
