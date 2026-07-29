import { useState } from 'react'

interface RegisterFormProps {
  onSubmit: (name: string, email: string, password: string) => Promise<void>
  onSwitchToLogin: () => void
  loading?: boolean
}

export function RegisterForm({ onSubmit, onSwitchToLogin, loading }: RegisterFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(name, email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="register-name" className="block text-sm font-medium text-slate-700">
          Nome
        </label>
        <input
          id="register-name"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
        />
      </div>
      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-slate-700">
          E-mail
        </label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
        />
      </div>
      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-slate-700">
          Senha
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
        />
        <p className="mt-1 text-xs text-slate-500">Mínimo de 8 caracteres.</p>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
      >
        {loading ? 'Criando conta...' : 'Criar conta'}
      </button>
      <p className="text-center text-sm text-slate-600">
        Já tem conta?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-emerald-700 underline"
        >
          Fazer login
        </button>
      </p>
    </form>
  )
}
