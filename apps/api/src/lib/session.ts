import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { and, eq, gt } from 'drizzle-orm'
import { getDb } from '../db/client.js'
import { sessions } from '../db/schema.js'

export const SESSION_COOKIE = 'appolitica_session'
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

function getSessionSecret(): string {
  return process.env.SESSION_SECRET ?? 'dev-insecure-session-secret-change-me'
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashSessionToken(token: string): string {
  return createHash('sha256').update(`${token}:${getSessionSecret()}`).digest('hex')
}

export async function createSession(userId: string): Promise<string> {
  const db = getDb()
  const token = generateSessionToken()
  const tokenHash = hashSessionToken(token)
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  await db.insert(sessions).values({
    id: randomUUID(),
    userId,
    tokenHash,
    expiresAt,
  })

  return token
}

export async function getUserIdFromToken(token: string): Promise<string | null> {
  const db = getDb()
  const tokenHash = hashSessionToken(token)
  const now = new Date()

  const rows = await db
    .select({ userId: sessions.userId })
    .from(sessions)
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
    .limit(1)

  return rows[0]?.userId ?? null
}

export async function deleteSession(token: string): Promise<void> {
  const db = getDb()
  const tokenHash = hashSessionToken(token)
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash))
}

export function sessionCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Lax' as const,
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  }
}
