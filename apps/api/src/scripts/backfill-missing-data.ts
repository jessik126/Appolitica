import { eq, or, isNull } from 'drizzle-orm'
import { getDb } from '../db/client.js'
import { mandatarios } from '../db/schema.js'

const CAMARA_BASE = 'https://dadosabertos.camara.leg.br/api/v2'
const SENADO_BASE = 'https://legis.senado.leg.br/dadosabertos'

function normalizeGenero(value?: string | null): 'feminino' | 'masculino' | 'nao_binario' | 'outro' | undefined {
  const normalized = value?.trim().toLowerCase()
  if (!normalized) return undefined
  if (['f', 'feminino', 'feminina'].includes(normalized)) return 'feminino'
  if (['m', 'masculino', 'masculina'].includes(normalized)) return 'masculino'
  if (['nb', 'nao binario', 'nao_binario', 'não binário', 'nao-binario'].includes(normalized)) return 'nao_binario'
  return 'outro'
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    throw new Error(`Request failed for ${url}: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

async function backfillCamara() {
  const db = getDb()
  const rows = await db.query.mandatarios.findMany({
    where: or(eq(mandatarios.casa, 'CD'), eq(mandatarios.casa, 'CD')),
  })

  for (const row of rows) {
    if (!row.externalId) continue

    const detail = await fetchJson<{ dados?: { sexo?: string; nomeCivil?: string; ultimoStatus?: { nome?: string; nomeEleitoral?: string; siglaPartido?: string; siglaUf?: string; urlFoto?: string; email?: string; gabinete?: { email?: string } } } }>(
      `${CAMARA_BASE}/deputados/${row.externalId}`,
    )

    const dados = detail.dados
    const status = dados?.ultimoStatus
    const email = status?.email?.trim() || status?.gabinete?.email?.trim() || undefined
    const foto = status?.urlFoto || undefined
    const genero = normalizeGenero(dados?.sexo ?? status?.nome)

    await db
      .update(mandatarios)
      .set({
        nome: dados?.nomeCivil || row.nome,
        nomeUrna: status?.nomeEleitoral || status?.nome || row.nomeUrna,
        partido: status?.siglaPartido || row.partido,
        uf: status?.siglaUf || row.uf,
        foto: foto ?? row.foto ?? null,
        genero: genero ?? row.genero ?? null,
        contatos: {
          ...(row.contatos ?? {}),
          ...(email ? { email } : {}),
          site: `https://www.camara.leg.br/deputados/${row.externalId}`,
        },
      })
      .where(eq(mandatarios.id, row.id))
  }
}

async function backfillSenado() {
  const db = getDb()
  const rows = await db.query.mandatarios.findMany({
    where: or(eq(mandatarios.casa, 'SF'), eq(mandatarios.casa, 'SF')),
  })

  for (const row of rows) {
    if (!row.externalId) continue

    const detail = await fetchJson<{ DetalheParlamentar?: { Parlamentar?: { IdentificacaoParlamentar?: { SexoParlamentar?: string; NomeParlamentar?: string; NomeCompletoParlamentar?: string; SiglaPartidoParlamentar?: string; UfParlamentar?: string; UrlFotoParlamentar?: string; UrlPaginaParlamentar?: string; EmailParlamentar?: string } } } }>(
      `${SENADO_BASE}/senador/${row.externalId}.json`,
    )

    const parlamentar = detail.DetalheParlamentar?.Parlamentar
    const identificacao = parlamentar?.IdentificacaoParlamentar
    const email = identificacao?.EmailParlamentar?.trim() || undefined
    const genero = normalizeGenero(identificacao?.SexoParlamentar)

    await db
      .update(mandatarios)
      .set({
        nome: identificacao?.NomeCompletoParlamentar || row.nome,
        nomeUrna: identificacao?.NomeParlamentar || row.nomeUrna,
        partido: identificacao?.SiglaPartidoParlamentar || row.partido,
        uf: identificacao?.UfParlamentar || row.uf,
        foto: identificacao?.UrlFotoParlamentar || row.foto || null,
        genero: genero ?? row.genero ?? null,
        contatos: {
          ...(row.contatos ?? {}),
          ...(email ? { email } : {}),
          ...(identificacao?.UrlPaginaParlamentar ? { site: identificacao.UrlPaginaParlamentar } : {}),
        },
      })
      .where(eq(mandatarios.id, row.id))
  }
}

async function main() {
  const db = getDb()
  const missingRows = await db.query.mandatarios.findMany({
    where: or(isNull(mandatarios.genero), eq(mandatarios.genero, '')),
  })

  console.log(`Found ${missingRows.length} rows missing genero.`)
  await backfillCamara()
  await backfillSenado()
  console.log('Backfill complete.')
}

main().catch((err) => {
  console.error('Backfill failed:', err)
  process.exit(1)
})
