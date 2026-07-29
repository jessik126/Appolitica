import { syncSenadoSenadores } from '../services/senado.js'

async function main() {
  console.log('Syncing Senado senadores...')
  const cache = await syncSenadoSenadores()
  console.log(`Done: ${cache.metadata.total} senadores (${cache.metadata.ultimaAtualizacao})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
