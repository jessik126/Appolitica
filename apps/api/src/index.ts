import { sql } from 'drizzle-orm'
import 'dotenv/config'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getDb } from './db/client.js'
import { auth } from './routes/auth.js'
import { me } from './routes/me.js'
import { politicos } from './routes/politicos.js'
import { portal } from './routes/portal.js'
import { sync } from './routes/sync.js'
import { isPortalConfigured } from './services/portal.js'

const app = new Hono()

app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  }),
)

app.get('/health', async (c) => {
  let dbOk = false
  try {
    const db = getDb()
    await db.execute(sql`SELECT 1`)
    dbOk = true
  } catch {
    dbOk = false
  }

  return c.json({
    ok: dbOk,
    service: '@appolitica/api',
    db: dbOk ? 'connected' : 'disconnected',
    portalConfigured: isPortalConfigured(),
    timestamp: new Date().toISOString(),
  })
})

app.route('/auth', auth)
app.route('/me', me)
app.route('/politicos', politicos)
app.route('/portal', portal)
app.route('/sync', sync)

const port = Number(process.env.PORT ?? 3001)
const migrationsFolder = join(dirname(fileURLToPath(import.meta.url)), 'db/migrations')

async function start() {
  const db = getDb()
  await migrate(db, { migrationsFolder })

  const server = serve({ fetch: app.fetch, port }, () => {
    console.log(`@appolitica/api listening on http://localhost:${port}`)
    if (isPortalConfigured()) {
      console.log('Portal da Transparência: token configured')
    }
  })

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Port ${port} is already in use. Stop the other process (lsof -i :${port}) or set PORT.`,
      )
    } else {
      console.error('Server error:', err)
    }
    process.exit(1)
  })

  const shutdown = () => {
    server.close(() => process.exit(0))
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

start().catch((err) => {
  console.error('Failed to start API:', err)
  process.exit(1)
})
