const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { Pool } = require('pg');
const app = require('../src/server');

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

const createdUsers = [];

async function cleanUsers() {
  for (const id of createdUsers) {
    await pool.query('DELETE FROM tickets WHERE requester_id = $1', [id]);
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  }
  createdUsers.length = 0;
}

describe('POST /auth/register', () => {
  before(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', ['qa.register@test.com']);
  });

  after(cleanUsers);

  it('registra um usuário com sucesso (201)', async () => {
    const res = await request(app).post('/auth/register').send({
      name: 'QA Test',
      email: 'qa.register@test.com',
      password: '1234',
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.user.email, 'qa.register@test.com');
    assert.strictEqual(res.body.user.role, 'requester');
    createdUsers.push(res.body.user.id);
  });

  it('rejeita sem nome/e-mail/senha (400)', async () => {
    const res = await request(app).post('/auth/register').send({});

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.ok, false);
  });

  it('rejeita senha com menos de 4 caracteres (400)', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'QA', email: 'qa.short@test.com', password: 'abc' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.ok, false);
  });

  it('rejeita e-mail já cadastrado (409)', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'Duplicado', email: 'gestor@helpdesk.com', password: '1234' });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.ok, false);
  });
});

describe('POST /auth/login', () => {
  it('faz login com credenciais válidas (200)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'gestor@helpdesk.com', password: '123456' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.user.email, 'gestor@helpdesk.com');
  });

  it('rejeita sem e-mail ou senha (400)', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'gestor@helpdesk.com' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.ok, false);
  });

  it('rejeita senha incorreta (401)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'gestor@helpdesk.com', password: 'senha-errada' });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.ok, false);
  });

  it('rejeita e-mail inexistente (401)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nao.existe@test.com', password: '1234' });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.ok, false);
  });
});
