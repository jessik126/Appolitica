const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed || !EMAIL_RE.test(trimmed)) return 'Informe um e-mail válido.'
  return null
}

export function validateName(name: string): string | null {
  const trimmed = name.trim()
  if (trimmed.length < 2) return 'O nome deve ter pelo menos 2 caracteres.'
  if (trimmed.length > 80) return 'O nome deve ter no máximo 80 caracteres.'
  return null
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}
