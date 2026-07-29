import { Hono } from 'hono'
import { syncCamaraDeputados } from '../services/camara.js'
import { syncSenadoSenadores } from '../services/senado.js'

const sync = new Hono()

sync.post('/camara', async (c) => {
  const cache = await syncCamaraDeputados()
  return c.json({
    ok: true,
    total: cache.metadata.total,
    ultimaAtualizacao: cache.metadata.ultimaAtualizacao,
  })
})

sync.post('/senado', async (c) => {
  const cache = await syncSenadoSenadores()
  return c.json({
    ok: true,
    total: cache.metadata.total,
    ultimaAtualizacao: cache.metadata.ultimaAtualizacao,
  })
})

sync.post('/all', async (c) => {
  const [camara, senado] = await Promise.all([
    syncCamaraDeputados(),
    syncSenadoSenadores(),
  ])

  return c.json({
    ok: true,
    camara: camara.metadata,
    senado: senado.metadata,
  })
})

export { sync }
