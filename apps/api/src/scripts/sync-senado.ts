import { closeDb } from '../db/client.js'
import { syncSenadoSenadores } from '../services/senado.js'

async function main() {
  console.log('Syncing Senado senadores...')
  const cache = await syncSenadoSenadores()
  console.log(`Done: ${cache.metadata.total} senadores (${cache.metadata.ultimaAtualizacao})`)
  await closeDb()
}

main().catch(async (err) => {
  console.error(err)
  await closeDb()
  process.exit(1)
})
