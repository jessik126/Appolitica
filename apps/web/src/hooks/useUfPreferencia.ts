import type { AuthUser } from '../types/politico'

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export function useUfPreferencia(user: AuthUser | null) {
  const uf = user?.uf ?? ''
  const hasUf = Boolean(uf)
  return { uf, ufs: UFS, hasUf }
}
