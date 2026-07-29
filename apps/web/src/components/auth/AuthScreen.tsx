import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (name: string, email: string, password: string) => Promise<void>
  error?: string | null
  loading?: boolean
}

export function AuthScreen({ onLogin, onRegister, error, loading }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-700 text-sm font-bold text-white">
            A
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900">AppoliticA</p>
            <p className="text-xs text-slate-500">Acompanhe quem te representa</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            {mode === 'login' ? 'Fazer login' : 'Criar conta'}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {mode === 'login'
              ? 'Entre para montar sua cola e acompanhar políticos.'
              : 'Cadastre-se gratuitamente para usar o AppoliticA.'}
          </p>

          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}

          <div className="mt-6">
            {mode === 'login' ? (
              <LoginForm
                onSubmit={onLogin}
                onSwitchToRegister={() => setMode('register')}
                loading={loading}
              />
            ) : (
              <RegisterForm
                onSubmit={onRegister}
                onSwitchToLogin={() => setMode('login')}
                loading={loading}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
