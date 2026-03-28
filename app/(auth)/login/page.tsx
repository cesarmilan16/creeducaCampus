import Link from 'next/link'
import LoginForm from './_components/login-form'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2EDE7] px-4">
      <div className="flex w-full max-w-sm flex-col items-center">
        {/* Logo fuera del contenedor */}
        <img src="/logo.png" alt="CRE EDUCA" className="mb-4 h-48 w-auto" />

        <div className="w-full rounded-2xl border border-[#E5E0D9] bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <p className="text-base font-semibold text-[#1B3557]">Iniciar sesión</p>
            <p className="mt-0.5 text-xs text-gray-400">Plataforma educativa</p>
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

</div>
      </div>
    </main>
  )
}
