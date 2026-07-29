import type { AuthUser } from '@appolitica/types'
import type { UserRow } from '../db/schema.js'

export function toAuthUser(user: UserRow): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    uf: user.uf ?? null,
    onboardingStep: user.onboardingStep,
    onboardingCompleted: Boolean(user.onboardingCompletedAt),
  }
}

export function isOnboardingComplete(user: UserRow): boolean {
  return Boolean(user.onboardingCompletedAt)
}
