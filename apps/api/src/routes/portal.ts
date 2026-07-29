import { Hono } from 'hono'
import {
  getDespesasPorOrgao,
  isPortalConfigured,
  validatePortalConnection,
} from '../services/portal.js'

const portal = new Hono()

portal.get('/status', async (c) => {
  if (!isPortalConfigured()) {
    return c.json({
      configured: false,
      ok: false,
      message: 'Defina PORTAL_TRANSPARENCIA_TOKEN em apps/api/.env',
    })
  }

  const result = await validatePortalConnection()
  return c.json({
    configured: true,
    ok: result.ok,
    message: result.message,
  })
})

portal.get('/despesas/orgao', async (c) => {
  const codigoOrgao = c.req.query('codigoOrgao')
  const ano = c.req.query('ano')
  const mes = c.req.query('mes')
  const pagina = c.req.query('pagina') ?? '1'

  if (!codigoOrgao || !ano || !mes) {
    return c.json(
      { error: 'Parâmetros obrigatórios: codigoOrgao, ano, mes (ex.: 20000, 2025, 1)' },
      400,
    )
  }

  try {
    const itens = await getDespesasPorOrgao(codigoOrgao, ano, mes, Number(pagina))
    return c.json({ itens, total: itens.length, codigoOrgao, ano, mes })
  } catch (err) {
    return c.json(
      { error: err instanceof Error ? err.message : 'Erro ao consultar Portal.' },
      502,
    )
  }
})

export { portal }
