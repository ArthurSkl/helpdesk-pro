const { readFileSync } = require('fs')
const { join } = require('path')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '123',
  database: process.env.PGDATABASE || 'Help-Desk',
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
})

async function ensureUnique(table, column) {
  const constraint = `${table}_${column}_key`
  const result = await pool.query(
    `SELECT 1 FROM pg_constraint c
     JOIN pg_class t ON t.oid = c.conrelid
     WHERE t.relname = $1 AND c.conname = $2`,
    [table, constraint]
  )
  if (result.rows.length === 0) {
    await pool.query(`ALTER TABLE ${table} ADD UNIQUE (${column})`)
    console.log(`  UNIQUE adicionado em ${table}.${column}`)
  }
}

async function reconcileStatuses() {
  await pool.query(`
    UPDATE ticket_statuses SET name = 'Em Atendimento' WHERE name = 'Em andamento'
  `)
  await pool.query(`
    UPDATE ticket_statuses SET name = 'Encerrado' WHERE name = 'Fechado'
  `)
}

async function upsertLookups() {
  const statuses = [
    ['Aberto', 1],
    ['Em Atendimento', 2],
    ['Resolvido', 3],
    ['Encerrado', 4],
  ]
  for (const [name, sortOrder] of statuses) {
    await pool.query(
      `INSERT INTO ticket_statuses (name, sort_order)
       VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET sort_order = $2`,
      [name, sortOrder]
    )
  }

  const priorities = [
    ['Baixa', 1],
    ['Média', 2],
    ['Alta', 3],
  ]
  for (const [name, level] of priorities) {
    await pool.query(
      `INSERT INTO ticket_priorities (name, level)
       VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET level = $2`,
      [name, level]
    )
  }

  const categories = ['Hardware', 'Software', 'Rede']
  for (const name of categories) {
    await pool.query(
      `INSERT INTO ticket_categories (name) VALUES ($1)
       ON CONFLICT (name) DO NOTHING`,
      [name]
    )
  }
}

async function setup() {
  try {
    console.log('Rodando schema.sql...')
    const schemaPath = join(__dirname, 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')
    await pool.query(schema)
    console.log('Tabelas criadas.')

    console.log('Garantindo constraints UNIQUE nas lookup tables...')
    await ensureUnique('ticket_statuses', 'name')
    await ensureUnique('ticket_priorities', 'name')
    await ensureUnique('ticket_categories', 'name')

    console.log('Reconciliando nomes antigos das lookup tables...')
    await reconcileStatuses()

    console.log('Inserindo dados de lookup...')
    await upsertLookups()

    console.log('Verificando usuario de teste...')
    const existing = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['gestor@helpdesk.com']
    )

    if (existing.rows.length === 0) {
      const hash = await bcrypt.hash('123456', 10)
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)`,
        ['Gestor', 'gestor@helpdesk.com', hash, 'admin']
      )
      console.log('Usuario gestor@helpdesk.com / 123456 criado (admin)')
    } else {
      console.log('Usuario gestor@helpdesk.com ja existe')
    }

    console.log('Setup concluido!')
    await pool.end()
  } catch (err) {
    console.error('Erro no setup:', err.message)
    await pool.end()
    process.exit(1)
  }
}

setup()
