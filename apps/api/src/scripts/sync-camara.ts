import { syncCamaraDeputados } from '../services/camara.js'

async function main() {
  console.log('Syncing Câmara deputados...')
  const cache = await syncCamaraDeputados()
  console.log(`Done: ${cache.metadata.total} deputados (${cache.metadata.ultimaAtualizacao})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
