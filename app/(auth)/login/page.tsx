import Link from 'next/link'
import LoginForm from './_components/login-form'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          Iniciar Sesión
        </h1>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link
            href="/registro"
            className="font-medium text-blue-600 hover:underline"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </main>
  )
}
