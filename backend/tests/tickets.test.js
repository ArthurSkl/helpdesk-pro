const { describe, it, after } = require('node:test');
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

const createdTickets = [];

const validTicket = {
  title: 'Teste de API - Computador não liga',
  description: 'Ticket criado pela suíte de testes de API',
  requester_id: 1,
  category_id: 1,
  status_id: 1,
  priority_id: 1,
};

async function cleanTickets() {
  for (const id of createdTickets) {
    await pool.query('DELETE FROM tickets WHERE id = $1', [id]);
  }
  createdTickets.length = 0;
}

describe('GET /tickets', () => {
  it('retorna a lista de tickets (200)', async () => {
    const res = await request(app).get('/tickets');

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length > 0);
  });
});

describe('GET /tickets/:id', () => {
  it('retorna ticket existente (200)', async () => {
    const list = await request(app).get('/tickets');
    const id = list.body[0].id;

    const res = await request(app).get(`/tickets/${id}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.ticket.id, id);
  });

  it('retorna 404 para ticket inexistente', async () => {
    const res = await request(app).get('/tickets/999999');

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.ok, false);
  });
});

describe('POST /tickets', () => {
  after(cleanTickets);

  it('cria um ticket com sucesso (201) e gera código TKT-', async () => {
    const res = await request(app).post('/tickets').send(validTicket);

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.ok, true);
    assert.match(res.body.ticket.code, /^TKT-\d+$/);
    createdTickets.push(res.body.ticket.id);
  });

  it('rejeita ticket sem campos obrigatórios (400)', async () => {
    const res = await request(app).post('/tickets').send({ title: 'Sem o resto' });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.ok, false);
    assert.ok(Array.isArray(res.body.missing));
    assert.ok(res.body.missing.includes('requester_id'));
  });
});

describe('PUT /tickets/:id', () => {
  after(cleanTickets);

  it('atualiza um ticket existente (200)', async () => {
    const created = await request(app).post('/tickets').send(validTicket);
    const id = created.body.ticket.id;
    createdTickets.push(id);

    const res = await request(app).put(`/tickets/${id}`).send({ ...validTicket, title: 'Título atualizado' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.ticket.title, 'Título atualizado');
  });

  it('retorna 404 ao atualizar ticket inexistente', async () => {
    const res = await request(app).put('/tickets/999999').send(validTicket);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.ok, false);
  });
});

describe('DELETE /tickets/:id', () => {
  it('remove um ticket existente (200) e retorna 404 na segunda chamada', async () => {
    const created = await request(app).post('/tickets').send(validTicket);
    const id = created.body.ticket.id;

    const first = await request(app).delete(`/tickets/${id}`);
    assert.strictEqual(first.status, 200);
    assert.strictEqual(first.body.ok, true);

    const second = await request(app).delete(`/tickets/${id}`);
    assert.strictEqual(second.status, 404);
  });

  it('retorna 404 ao remover ticket inexistente', async () => {
    const res = await request(app).delete('/tickets/999999');

    assert.strictEqual(res.status, 404);
  });
});
