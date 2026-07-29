import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Politico } from '@appolitica/types'
import { closeDb } from '../db/client.js'
import {
  replaceAcoesForPolitico,
  replaceMandatariosByFonte,
  todayIso,
  updateSyncMetadata,
} from '../db/repository.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MOCK_JSON = join(__dirname, '../data/mock-politicos.seed.json')
const FEDERAL_CARGOS = new Set(['deputado_federal', 'senador'])

interface MockDataset {
  metadata?: {
    eleicao?: number
    ultimaAtualizacao?: string
    fonte?: string
  }
  politicos: Politico[]
}

async function main() {
  let raw: string
  try {
    raw = await readFile(MOCK_JSON, 'utf-8')
  } catch {
    console.error(`Mock seed file not found: ${MOCK_JSON}`)
    console.error('If mock data is already in Postgres, no action needed.')
    process.exit(1)
  }

  const dataset = JSON.parse(raw) as MockDataset
  const mockPoliticos = dataset.politicos.filter((p) => !FEDERAL_CARGOS.has(p.cargo))

  const mandatarios = mockPoliticos.map(({ acoes: _acoes, ...rest }) => ({
    ...rest,
    fonte: 'mock' as const,
  }))

  await replaceMandatariosByFonte(mandatarios, 'mock')

  for (const politico of mockPoliticos) {
    if (politico.acoes?.length) {
      await replaceAcoesForPolitico(politico.id, politico.acoes)
    }
  }

  await updateSyncMetadata('mock', {
    ultimaAtualizacao: dataset.metadata?.ultimaAtualizacao ?? todayIso(),
    total: mandatarios.length,
    label: dataset.metadata?.fonte ?? 'Mock local (cargos estaduais/presidenciais)',
  })

  console.log(`Seeded ${mandatarios.length} mock políticos into Postgres.`)
  await closeDb()
}

main().catch(async (err) => {
  console.error('Mock seed failed:', err)
  await closeDb()
  process.exit(1)
})
