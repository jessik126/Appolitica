import { closeDb } from '../db/client.js'
import { syncCamaraDeputados } from '../services/camara.js'

async function main() {
  console.log('Syncing Câmara deputados...')
  const cache = await syncCamaraDeputados()
  console.log(`Done: ${cache.metadata.total} deputados (${cache.metadata.ultimaAtualizacao})`)
  await closeDb()
}

main().catch(async (err) => {
  console.error(err)
  await closeDb()
  process.exit(1)
})
