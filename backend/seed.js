const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '123',
  database: process.env.PGDATABASE || 'Help-Desk',
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function seed() {
  try {
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', ['gestor@helpdesk.com']);
    if (existing.rows.length === 0) {
      const hash = await bcrypt.hash('123456', 10);
      await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        ['Gestor', 'gestor@helpdesk.com', hash, 'admin']
      );
      console.log('Usuário gestor@helpdesk.com criado com sucesso');
    } else {
      console.log('Usuário gestor@helpdesk.com já existe');
    }

    await pool.end();
  } catch (err) {
    console.error('Erro no seed:', err.message);
    await pool.end();
  }
}

seed();
