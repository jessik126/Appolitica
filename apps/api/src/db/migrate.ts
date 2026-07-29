import 'dotenv/config'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { closeDb, getDb } from './client.js'

const migrationsFolder = join(dirname(fileURLToPath(import.meta.url)), 'migrations')

async function main() {
  const db = getDb()
  await migrate(db, { migrationsFolder })
  console.log('Database migrations applied.')
  await closeDb()
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
