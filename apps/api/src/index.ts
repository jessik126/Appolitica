import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { politicos } from './routes/politicos.js'
import { portal } from './routes/portal.js'
import { sync } from './routes/sync.js'
import { isPortalConfigured } from './services/portal.js'

const app = new Hono()

app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  }),
)

app.get('/health', (c) =>
  c.json({
    ok: true,
    service: '@appolitica/api',
    portalConfigured: isPortalConfigured(),
    timestamp: new Date().toISOString(),
  }),
)

app.route('/politicos', politicos)
app.route('/portal', portal)
app.route('/sync', sync)

const port = Number(process.env.PORT ?? 3001)

console.log(`@appolitica/api listening on http://localhost:${port}`)
if (isPortalConfigured()) {
  console.log('Portal da Transparência: token configured')
}

serve({ fetch: app.fetch, port })
