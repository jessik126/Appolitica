import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Mandatario } from '@appolitica/types'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const DATA_DIR = join(__dirname, '..', 'data')

export interface CacheMetadata {
  ultimaAtualizacao: string
  total: number
  fonte: string
}

export interface MandatariosCache {
  metadata: CacheMetadata
  mandatarios: Mandatario[]
}

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true })
}

export async function readCache(filename: string): Promise<MandatariosCache | null> {
  try {
    const raw = await readFile(join(DATA_DIR, filename), 'utf-8')
    return JSON.parse(raw) as MandatariosCache
  } catch {
    return null
  }
}

export async function writeCache(filename: string, cache: MandatariosCache): Promise<void> {
  await ensureDataDir()
  await writeFile(join(DATA_DIR, filename), JSON.stringify(cache, null, 2), 'utf-8')
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}
