import type { MeuAcompanhamento, MinhaCola } from '../types/politico'
import { fetchAcompanhamento, fetchCola } from './api'
import { migrateLocalStorageIfNeeded } from './migrateLocalStorage'

export interface PersonalDataSnapshot {
  acompanhamento: MeuAcompanhamento[]
  cola: MinhaCola
  uf: string | null
}

let bootstrapPromise: Promise<PersonalDataSnapshot> | null = null

export function resetPersonalDataBootstrap() {
  bootstrapPromise = null
}

export function ensurePersonalDataBootstrapped(userUf: string | null): Promise<PersonalDataSnapshot> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const [acompanhamento, cola] = await Promise.all([fetchAcompanhamento(), fetchCola()])
      return migrateLocalStorageIfNeeded(acompanhamento, cola, userUf)
    })()
  }
  return bootstrapPromise
}
