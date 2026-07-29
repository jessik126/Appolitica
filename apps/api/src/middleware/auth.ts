import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { getUserIdFromToken, SESSION_COOKIE } from '../lib/session.js'

export type AuthVariables = {
  userId: string
}

export async function requireAuth(c: Context<{ Variables: AuthVariables }>, next: Next) {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) {
    return c.json({ error: 'Não autenticado.' }, 401)
  }

  const userId = await getUserIdFromToken(token)
  if (!userId) {
    return c.json({ error: 'Sessão inválida ou expirada.' }, 401)
  }

  c.set('userId', userId)
  await next()
}

export async function optionalAuth(c: Context<{ Variables: AuthVariables }>, next: Next) {
  const token = getCookie(c, SESSION_COOKIE)
  if (token) {
    const userId = await getUserIdFromToken(token)
    if (userId) c.set('userId', userId)
  }
  await next()
}
