const { describe, it, after } = require('node:test');
const assert = require('node:assert');
const { mock } = require('node:test');
const bcrypt = require('bcryptjs');
const authController = require('../../controllers/authController');
const User = require('../../src/models/User');

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

describe('authController.register', () => {
  it('retorna 400 quando campos obrigatórios estão ausentes', async () => {
    const res = mockRes();
    await authController.register({ body: {} }, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.ok, false);
  });

  it('retorna 400 quando a senha tem menos de 4 caracteres', async () => {
    const res = mockRes();
    await authController.register({ body: { name: 'A', email: 'a@a.com', password: '123' } }, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.ok, false);
  });

  it('retorna 409 quando o e-mail já está cadastrado', async () => {
    mock.method(User, 'findByEmail', async () => ({ id: 1, email: 'a@a.com' }));
    const res = mockRes();
    await authController.register({ body: { name: 'A', email: 'a@a.com', password: '1234' } }, res);
    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.body.ok, false);
  });

  it('retorna 201 e cria o usuário com sucesso', async () => {
    mock.method(User, 'findByEmail', async () => null);
    mock.method(User, 'create', async (data) => ({ id: 1, name: data.name, email: data.email, role: 'requester' }));
    const res = mockRes();
    await authController.register({ body: { name: 'Teste', email: 'teste@teste.com', password: '1234' } }, res);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.user.email, 'teste@teste.com');
  });
});

describe('authController.login', () => {
  it('retorna 400 quando e-mail ou senha estão ausentes', async () => {
    const res = mockRes();
    await authController.login({ body: { email: 'a@a.com' } }, res);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.ok, false);
  });

  it('retorna 401 para e-mail inexistente', async () => {
    mock.method(User, 'findByEmail', async () => null);
    const res = mockRes();
    await authController.login({ body: { email: 'nao@existe.com', password: '1234' } }, res);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.ok, false);
  });

  it('retorna 401 para senha incorreta', async () => {
    const hash = await bcrypt.hash('1234', 4);
    mock.method(User, 'findByEmail', async () => ({ id: 1, email: 'a@a.com', password_hash: hash }));
    const res = mockRes();
    await authController.login({ body: { email: 'a@a.com', password: 'errada' } }, res);
    assert.strictEqual(res.statusCode, 401);
  });

  it('retorna 200 e o usuário no login válido', async () => {
    const hash = await bcrypt.hash('1234', 4);
    mock.method(User, 'findByEmail', async () => ({ id: 1, name: 'A', email: 'a@a.com', role: 'admin', password_hash: hash }));
    const res = mockRes();
    await authController.login({ body: { email: 'a@a.com', password: '1234' } }, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.user.email, 'a@a.com');
  });
});
