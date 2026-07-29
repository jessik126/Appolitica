import { useCallback, useEffect, useState } from 'react'
import type { AuthUser } from '../types/politico'
import { fetchAuthMe, loginUser, logoutUser, registerUser } from '../lib/api'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const me = await fetchAuthMe()
      setUser(me)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar sessão.')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    const nextUser = await loginUser({ email, password })
    setUser(nextUser)
    return nextUser
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    setError(null)
    const nextUser = await registerUser({ name, email, password })
    setUser(nextUser)
    return nextUser
  }, [])

  const logout = useCallback(async () => {
    setError(null)
    await logoutUser()
    setUser(null)
  }, [])

  const setUserState = useCallback((nextUser: AuthUser) => {
    setUser(nextUser)
  }, [])

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refresh,
    setUser: setUserState,
    setError,
    isAuthenticated: Boolean(user),
    needsOnboarding: Boolean(user && !user.onboardingCompleted),
  }
}
