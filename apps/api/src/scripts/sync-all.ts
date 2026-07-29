import { syncCamaraDeputados } from '../services/camara.js'
import { syncSenadoSenadores } from '../services/senado.js'

async function main() {
  console.log('Syncing all federal data...')
  const [camara, senado] = await Promise.all([
    syncCamaraDeputados(),
    syncSenadoSenadores(),
  ])
  console.log(`Câmara: ${camara.metadata.total} deputados`)
  console.log(`Senado: ${senado.metadata.total} senadores`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
