import { neon } from '@neondatabase/serverless'
import { Pool } from '@neondatabase/serverless'

let pool: Pool | null = null

export async function getConnection() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }

  if (!pool) {
    pool = new Pool({ connectionString })
  }

  return pool
}

export async function query(text: string, params?: (string | number | boolean | null)[]) {
  const connection = await getConnection()
  return connection.query(text, params)
}

export async function queryOne(text: string, params?: (string | number | boolean | null)[]) {
  const result = await query(text, params)
  return result.rows[0] || null
}

export async function queryMany(text: string, params?: (string | number | boolean | null)[]) {
  const result = await query(text, params)
  return result.rows || []
}
