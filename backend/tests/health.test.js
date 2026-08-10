const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/server');

describe('GET /test-db', () => {
  it('confirma a conexão com o banco (200)', async () => {
    const res = await request(app).get('/test-db');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.ok, true);
    assert.ok(res.body.now);
  });
});
