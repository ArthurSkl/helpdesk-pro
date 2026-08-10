const { describe, it, after } = require('node:test');
const assert = require('node:assert');
const { mock } = require('node:test');
const ticketsController = require('../../controllers/ticketsController');
const Ticket = require('../../src/models/Ticket');

after(() => {
  mock.restoreAll();
});

function mockRes() {
  const res = {};
  res.statusCode = 200;
  res.body = null;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
}

describe('ticketsController.list', () => {
  it('retorna 200 com a lista de tickets', async () => {
    mock.method(Ticket, 'findAll', async () => [{ id: 1 }, { id: 2 }]);
    const res = mockRes();
    await ticketsController.list({}, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.length, 2);
  });
});

describe('ticketsController.getById', () => {
  it('retorna 200 com o ticket encontrado', async () => {
    mock.method(Ticket, 'findById', async () => ({ id: 1, title: 'Teste' }));
    const res = mockRes();
    await ticketsController.getById({ params: { id: 1 } }, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.ticket.id, 1);
  });

  it('retorna 404 quando o ticket não existe', async () => {
    mock.method(Ticket, 'findById', async () => null);
    const res = mockRes();
    await ticketsController.getById({ params: { id: 999 } }, res);
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.body.ok, false);
  });
});

describe('ticketsController.create', () => {
  it('retorna 400 listando os campos obrigatórios ausentes', async () => {
    const res = mockRes();
    await ticketsController.create({ body: { title: 'Sem o resto' } }, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.ok, false);
    assert.ok(res.body.missing.includes('requester_id'));
    assert.ok(res.body.missing.includes('category_id'));
  });

  it('retorna 201 ao criar ticket com todos os campos', async () => {
    mock.method(Ticket, 'create', async (data) => ({ id: 1, ...data, code: 'TKT-001' }));
    const body = {
      title: 'T',
      description: 'D',
      requester_id: 1,
      category_id: 1,
      status_id: 1,
      priority_id: 1,
    };
    const res = mockRes();
    await ticketsController.create({ body }, res);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.ticket.code, 'TKT-001');
  });
});

describe('ticketsController.update', () => {
  it('retorna 200 ao atualizar ticket existente', async () => {
    mock.method(Ticket, 'update', async (id, data) => ({ id, ...data }));
    const res = mockRes();
    await ticketsController.update({ params: { id: 1 }, body: { title: 'Novo' } }, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.ticket.title, 'Novo');
  });

  it('retorna 404 ao atualizar ticket inexistente', async () => {
    mock.method(Ticket, 'update', async () => null);
    const res = mockRes();
    await ticketsController.update({ params: { id: 999 }, body: { title: 'X' } }, res);
    assert.strictEqual(res.statusCode, 404);
  });
});

describe('ticketsController.delete', () => {
  it('retorna 200 ao remover ticket existente', async () => {
    mock.method(Ticket, 'delete', async () => ({ id: 1 }));
    const res = mockRes();
    await ticketsController.delete({ params: { id: 1 } }, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ok, true);
  });

  it('retorna 404 ao remover ticket inexistente', async () => {
    mock.method(Ticket, 'delete', async () => null);
    const res = mockRes();
    await ticketsController.delete({ params: { id: 999 } }, res);
    assert.strictEqual(res.statusCode, 404);
  });
});
