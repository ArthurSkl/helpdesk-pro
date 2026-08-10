const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/server');

describe('GET /references', () => {
  it('retorna os status de ticket (200)', async () => {
    const res = await request(app).get('/references/statuses');

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length > 0);
  });

  it('retorna as prioridades de ticket (200)', async () => {
    const res = await request(app).get('/references/priorities');

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length > 0);
  });

  it('retorna as categorias de ticket (200)', async () => {
    const res = await request(app).get('/references/categories');

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length > 0);
  });

  it('retorna os usuários ativos (200)', async () => {
    const res = await request(app).get('/references/users');

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });
});
