# Plano de Qualidade (QA) — HelpDesk Pro

## 1. Objetivo

Este documento define a estratégia de qualidade aplicada ao **HelpDesk Pro**, cobrindo testes de API, testes end-to-end (E2E), integração contínua e gestão de evidências. O objetivo é garantir que os fluxos críticos do sistema (autenticação, CRUD de chamados, navegação e integração com o banco de dados) sejam validados de forma automatizada, reproduzível e auditável.

## 2. Escopo

| Camada | Cobertura |
| --- | --- |
| API (backend) | Contratos de autenticação, CRUD de tickets, endpoints de referência e saúde do banco |
| Frontend (E2E) | Autenticação, navegação, dashboard, CRUD de chamados |
| Banco de dados | Schema, conexão e integridade referencial |
| CI | Execução automática de API e E2E a cada push/PR na `main` |

**Fora do escopo atual:** testes de unidade dos controllers/models, testes de performance, testes de segurança ofensiva e regressão visual.

## 3. Pirâmide de testes aplicada

```
        /  E2E  \        47 casos (Cypress)
       /----------\
      /   API     \      22 casos (node:test + Supertest)
     /--------------\
    /  Unitários   \     pendente (evolução)
   /------------------\
```

A maior parte da validação está concentrada em testes de API e E2E, alinhado a um projeto de médio porte onde os fluxos de usuário são o principal risco.

## 4. Stack de testes

| Ferramenta | Uso | Localização |
| --- | --- | --- |
| Cypress 15 | Testes E2E | `cypress/e2e/*.cy.js` |
| Node.js `node:test` | Runner dos testes de API | `backend/tests/*.test.js` |
| Supertest | Cliente HTTP para testes de API | `backend/tests/*.test.js` |
| PostgreSQL | Banco de dados de execução | `backend/schema.sql` |
| GitHub Actions | CI (jobs `api-tests` e `cypress-run`) | `.github/workflows/cypress.yml` |

## 5. Testes de API (backend)

**Comando:** `cd backend && npm test`

| Suíte | Arquivo | Casos | Endpoints cobertos |
| --- | --- | --- | --- |
| Autenticação | `tests/auth.test.js` | 8 | `POST /auth/register`, `POST /auth/login` |
| Tickets | `tests/tickets.test.js` | 9 | `GET/POST/PUT/DELETE /tickets` e `GET /tickets/:id` |
| Referências | `tests/references.test.js` | 4 | `GET /references/{statuses,priorities,categories,users}` |
| Saúde do banco | `tests/health.test.js` | 1 | `GET /test-db` |

**Validações principais:**

- **Cadastro:** sucesso (201), campos obrigatórios (400), senha curta (400), e-mail duplicado (409).
- **Login:** sucesso (200), credenciais ausentes (400), senha incorreta (401), e-mail inexistente (401).
- **Tickets:** listagem, busca por ID (200/404), criação (201 + geração de código `TKT-XXX`), campos obrigatórios (400), atualização (200/404), remoção (200/404 e remoção dupla).
- **Isolamento:** os testes criam seus próprios dados e os removem após a execução, podendo rodar contra banco vazio ou populado.

## 6. Testes E2E (Cypress)

**Comando:** `npm run cy:run` (frontend e backend ativos)

| Suíte | Arquivo | Casos | Fluxos |
| --- | --- | --- | --- |
| Autenticação | `cypress/e2e/auth.cy.js` | 14 | Login, logout, cadastro, validações, proteção de rotas |
| Dashboard | `cypress/e2e/dashboard.cy.js` | 15 | Métricas, tabela, filtros por status, navegação, exclusão |
| Navegação | `cypress/e2e/navigation.cy.js` | 7 | Redirecionamentos, persistência de sessão, localStorage |
| CRUD de chamados | `cypress/e2e/tickets.cy.js` | 11 | Criação, edição, detalhes, remoção |

**Total: 47 casos E2E.**

**Boa prática adotada:** os testes E2E usam `cy.intercept()` com fixtures para mockar a API, tornando a execução determinística e independente do backend. Os testes de API cobrem a integração real com o banco; os E2E cobrem a experiência do usuário. Essa separação evita testes E2E lentos e instáveis.

## 7. Configuração de execução

| Configuração | Valor | Efeito |
| --- | --- | --- |
| `viewport` | 1280x720 | Resolução fixa e previsível |
| `video: true` | gravado | Grava vídeo de cada execução em `cypress/videos/` |
| `retries: 1` | 1 tentativa extra | Repete teste que falhar por flakiness antes de marcar como falha |
| `allowCypressEnv: false` | desabilitado | Bloqueia exposição de variáveis de ambiente no browser (segurança) |
| Screenshot pós-teste | automático | Captura de tela após cada teste em `cypress/screenshots/` |

## 8. Integração contínua (GitHub Actions)

Workflow: `.github/workflows/cypress.yml` — executa em `push` e `pull_request` na `main`.

| Job | Responsabilidade |
| --- | --- |
| `api-tests` | Sobe Postgres como serviço, aplica `setup-db`, executa os 22 testes de API |
| `cypress-run` | Sobe Postgres + backend + frontend, executa os 47 testes E2E |

**Artefatos publicados por execução:**

- Screenshots E2E (`cypress/screenshots`)
- Vídeos E2E (`cypress/videos`)

Esses artefatos ficam disponíveis na aba **Actions** do repositório e podem ser baixados para análise de falhas.

## 9. Gestão de evidências

As evidências ficam em `docs/evidencias/` (versionadas no repositório):

| Pasta | Conteúdo |
| --- | --- |
| `docs/evidencias/screenshots/` | Capturas de tela dos testes |
| `docs/evidencias/videos/` | Gravações das execuções E2E |
| `docs/evidencias/api/` | Relatórios de saída dos testes de API |

**Como gerar:** rode `npm run cy:run` e `cd backend && npm test`, copie os arquivos gerados para `docs/evidencias/` conforme o `README.md` dessa pasta.

## 10. Critérios de aceite

Um release é considerado de qualidade quando:

1. Todos os testes de API passam (22/22).
2. Todos os testes E2E passam (47/47).
3. O CI está verde nos jobs `api-tests` e `cypress-run`.
4. As evidências da execução estão disponíveis (artefatos no Actions ou em `docs/evidencias/`).

## 11. Defeitos conhecidos e riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Login sem token JWT (sessão só em `localStorage`) | Sessão não protegida contra manipulação | Documentado; fora do escopo atual |
| `.env` do backend versionado no repositório | Exposição de credenciais locais | Usar variáveis de ambiente/segredos no CI e no repositório real |
| Dependência do Postgres local para testes de API | Testes falham sem banco | CI provisiona o banco como serviço |

## 12. Próximas evoluções

- Testes de unidade para controllers e models (camada unitária da pirâmide).
- Medição de cobertura de código.
- Testes de redes negativas no frontend (API fora do ar, erro 500).
- Testes em viewport mobile.
- Regressão visual.

## 13. Como executar tudo localmente

```bash
# 1. Subir banco e backend
cd backend
npm run setup-db
npm run dev

# 2. Em outro terminal, subir o frontend
npm run dev

# 3. Testes de API
cd backend
npm test

# 4. Testes E2E
npm run cy:run
```
