const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '123',
  database: process.env.PGDATABASE || 'Help-Desk',
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
})

function fixMojibake(value) {
  if (typeof value !== 'string' || !value.includes('Ã')) return value
  const fixed = Buffer.from(value, 'latin1').toString('utf8')
  return fixed.includes('\uFFFD') ? value : fixed
}

const REFS = {
  ticket_priorities: [['tickets', 'priority_id']],
  ticket_statuses: [['tickets', 'status_id']],
  ticket_categories: [['tickets', 'category_id']],
  users: [
    ['tickets', 'requester_id'],
    ['tickets', 'assignee_id'],
  ],
}

async function repairTable(table, column) {
  const result = await pool.query(`SELECT id, ${column} AS value FROM ${table}`)
  let updated = 0
  for (const row of result.rows) {
    const fixed = fixMojibake(row.value)
    if (fixed === row.value) continue

    const existing = await pool.query(
      `SELECT id FROM ${table} WHERE ${column} = $1 AND id <> $2`,
      [fixed, row.id]
    )

    if (existing.rows.length > 0) {
      const targetId = existing.rows[0].id
      for (const [refTable, refColumn] of REFS[table] || []) {
        await pool.query(
          `UPDATE ${refTable} SET ${refColumn} = $1 WHERE ${refColumn} = $2`,
          [targetId, row.id]
        )
      }
      await pool.query(`DELETE FROM ${table} WHERE id = $1`, [row.id])
      console.log(`  ${table}.${column} (id=${row.id}): "${row.value}" -> mesclado em "${fixed}" (id=${targetId})`)
    } else {
      await pool.query(`UPDATE ${table} SET ${column} = $1 WHERE id = $2`, [fixed, row.id])
      console.log(`  ${table}.${column} (id=${row.id}): "${row.value}" -> "${fixed}"`)
    }
    updated++
  }
  return updated
}

async function main() {
  try {
    console.log('Reparando dados corrompidos (UTF-8 lido como Latin-1)...')
    let total = 0
    const tables = [
      ['ticket_categories', 'name'],
      ['ticket_priorities', 'name'],
      ['ticket_statuses', 'name'],
      ['users', 'name'],
      ['tickets', 'title'],
      ['tickets', 'description'],
    ]
    for (const [table, column] of tables) {
      total += await repairTable(table, column)
    }
    console.log(`Concluido! ${total} registro(s) corrigido(s).`)
    await pool.end()
  } catch (err) {
    console.error('Erro:', err.message)
    await pool.end()
    process.exit(1)
  }
}

main()
