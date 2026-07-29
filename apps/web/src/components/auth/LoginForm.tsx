import { useState } from 'react'

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  onSwitchToRegister: () => void
  loading?: boolean
}

export function LoginForm({ onSubmit, onSwitchToRegister, loading }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">
          E-mail
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
          Senha
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
      <p className="text-center text-sm text-slate-600">
        Não tem conta?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-medium text-emerald-700 underline"
        >
          Cadastre-se
        </button>
      </p>
    </form>
  )
}
