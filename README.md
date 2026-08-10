# HelpDesk Pro

Sistema web de gerenciamento de chamados desenvolvido como projeto de portfólio e entrevista técnica. O projeto foi estruturado para demonstrar conhecimentos em desenvolvimento full stack, incluindo autenticação, controle de sessão, CRUD completo, integração com API REST, proteção de rotas, testes end-to-end e organização de frontend e backend em camadas separadas.

***

## Visão geral

O **HelpDesk Pro** simula um ambiente corporativo de atendimento interno ou suporte técnico, permitindo que usuários realizem login, cadastro, consulta de chamados, acompanhamento de status e operações completas de criação, edição, visualização e remoção de tickets.

No frontend, a aplicação utiliza **React** com **Vite** e navegação via **React Router DOM**. No backend, a API é executada localmente e consumida no frontend por meio de proxy configurado em `/api`, apontando para a porta `3001`.

***

## Stack utilizada

| Camada | Tecnologia |
| --- | --- |
| Frontend | React |
| Build e desenvolvimento | Vite |
| Roteamento | React Router DOM |
| Estilização | CSS puro |
| Sessão no cliente | `localStorage` |
| Backend | Node.js / API REST |
| Integração | Proxy `/api` para backend local |
| Banco de Dados | PostgreSQL |
| Testes E2E | Cypress |
| Qualidade de código | ESLint |
| Automação | GitHub Actions |

***

## Funcionalidades

- Login e cadastro de usuários
- Persistência de sessão no navegador com `localStorage`
- Proteção de rotas para páginas autenticadas
- Dashboard com métricas por status e listagem de chamados
- Filtro de chamados por status
- CRUD completo de tickets
- Carregamento dinâmico de status, prioridades, categorias e usuários
- Interface preparada para testes E2E com seletores `data-cy`
- Estrutura de automação para execução de testes com GitHub Actions

***

## Arquitetura

O projeto foi dividido em três partes principais:

- **Frontend**: interface da aplicação, navegação, páginas, componentes e consumo da API.
- **Backend**: estrutura responsável pelas rotas, controladores, configurações e integração com banco de dados.
- **Testes automatizados**: suíte E2E com Cypress, organizada com fixtures, suporte e evidências de execução.

Essa separação ajuda a tornar o projeto mais escalável, legível e alinhado com boas práticas de organização em aplicações web full stack.

***

## Estrutura do projeto

```bash
HelpDesk Pro - Projeto pessoal/
├── .github/
│   └── workflows/
│       └── cypress.yml              # Workflow de CI para testes
├── backend/
│   ├── controllers/                 # Lógica das rotas
│   ├── routes/                      # Endpoints da API
│   ├── src/                         # Configurações e módulos internos
│   ├── .env                         # Variáveis de ambiente do backend
│   ├── .env.example                 # Template de env
│   ├── package.json
│   ├── package-lock.json
│   ├── schema.sql                   # DDL das tabelas
│   ├── setup-db.js                  # Script de setup do banco (Node)
│   └── seed.js                      # Script de seed do banco
├── cypress/
│   ├── e2e/                         # Testes end-to-end
│   ├── fixtures/                    # Dados mockados
│   ├── screenshots/                 # Evidências de execução
│   └── support/                     # Comandos e configurações auxiliares
├── public/                          # Arquivos públicos
├── src/
│   ├── api/                         # Cliente HTTP e serviços de API
│   ├── assets/                      # Recursos estáticos
│   ├── components/                  # Componentes reutilizáveis
│   ├── pages/                       # Páginas principais da aplicação
│   ├── App.css                      # Estilos principais da aplicação
│   ├── App.jsx                      # Componente raiz
│   ├── index.css                    # Estilos globais
│   └── main.jsx                     # Ponto de entrada do React
├── .gitattributes
├── .gitignore
├── cypress.config.js                # Configuração do Cypress
├── eslint.config.js                 # Configuração do lint
├── index.html                       # Entrada HTML do Vite
├── package.json
├── package-lock.json
├── README.md
├── start project.txt                # Instruções operacionais
└── vite.config.js                   # Configuração do Vite e proxy
```

***

## Como executar

### 1. Clonar o projeto

```bash
git clone <URL_DO_REPOSITORIO>
cd "HelpDesk Pro - Projeto pessoal"
```

### 2. Instalar dependências do frontend

Na raiz do projeto:

```bash
npm install
```

### 3. Instalar dependências do backend

Na pasta `backend`:

```bash
cd backend
npm install
```

### 4. Configurar banco de dados

**Pré-requisito:** PostgreSQL instalado e rodando.

O arquivo `backend/.env` já contém as credenciais padrão:

```env
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=123
PGDATABASE=Help-Desk
```

Crie o banco de dados (caso não exista):

```bash
createdb -U postgres "Help-Desk"
```

Em seguida, execute o setup que cria as tabelas e insere o usuário de teste:

```bash
cd backend
npm run setup-db
```

> O setup cria um usuário admin: `gestor@helpdesk.com` / `123456`

### 5. Iniciar o backend

Ainda dentro da pasta `backend`:

```bash
npm run dev
```

A API deve ficar disponível em:

```bash
http://localhost:3001/
```

### 6. Iniciar o frontend

Em outro terminal, na raiz do projeto:

```bash
npm run dev
```

A aplicação frontend deve abrir em:

```bash
http://localhost:5173/
```

### 7. Executar testes com Cypress

Na raiz do projeto:

```bash
npm run cy:open    # abre a interface interativa
npm run cy:run     # executa em modo headless
```

Para rodar os testes de API do backend, veja a seção [Testes automatizados](#testes-automatizados).

> Observação: os testes devem ser executados a partir da raiz do projeto. Para alguns fluxos, o frontend precisa estar ativo durante a execução.

***

## Fluxo da aplicação

1. O usuário acessa a tela de login ou cadastro.
2. Após autenticação, os dados do usuário são armazenados no navegador.
3. O sistema libera o acesso às rotas protegidas.
4. O dashboard carrega os chamados e exibe métricas operacionais.
5. O usuário pode criar, editar, visualizar ou remover tickets.
6. O logout remove os dados de sessão e retorna o usuário à autenticação.

***

## Autenticação e sessão

O projeto utiliza autenticação integrada ao backend e persistência de sessão no frontend com `localStorage`. Após o login, o objeto `helpdesk_user` é armazenado no navegador e utilizado para manter o contexto do usuário autenticado e controlar o acesso às páginas protegidas.

Esse mecanismo não substitui o banco de dados. O banco é responsável pela persistência dos dados do sistema, enquanto o `localStorage` é utilizado apenas para manter a sessão no cliente e melhorar o fluxo de navegação no frontend.

***

## Páginas principais

### LoginPage

Responsável pelos fluxos de login e cadastro, validação básica de campos, mensagens de retorno e armazenamento do usuário autenticado.

### DashboardPage

Exibe a lista de chamados, métricas por status, filtros de visualização, logout e ações principais sobre cada ticket.

### TicketFormPage

Centraliza a criação e edição de chamados, carregando dados auxiliares da API e enviando o payload tratado para o backend.

### TicketDetailsPage

Mostra os detalhes completos de um chamado, incluindo informações operacionais e ações para voltar, editar ou remover.

***

## Testes automatizados

O projeto possui **69 testes automatizados** distribuídos em três camadas:

| Camada | Ferramenta | Quantidade | Localização |
| --- | --- | --- | --- |
| Unidade (controllers) | Node.js `node:test` | 17 | `backend/tests/unit/` |
| API | Node.js `node:test` + Supertest | 22 | `backend/tests/` |
| E2E (Cypress) | Cypress | 47 | `cypress/e2e/` |

A estratégia de qualidade está documentada em [`docs/QA.md`](docs/QA.md) (plano de QA, cobertura, CI e gestão de evidências).

### Executar testes de API

Na pasta `backend` (requer PostgreSQL rodando):

```bash
npm test
```

### Executar testes E2E

Com backend e frontend ativos, na raiz do projeto:

```bash
npm run cy:run
```

Cada execução gera screenshots e vídeos (evidências) em `cypress/screenshots/` e `cypress/videos/`. As evidências selecionadas ficam em `docs/evidencias/`.

***

## Diferenciais do projeto

- Organização separada entre frontend, backend e testes
- Estrutura preparada para CI com GitHub Actions
- Uso de rotas protegidas e controle de sessão
- Interface com foco em operações reais de helpdesk
- Projeto aplicável como demonstração técnica para vagas de desenvolvimento web e QA júnior

***

## Objetivo do projeto

O **HelpDesk Pro** foi construído para demonstrar capacidade de desenvolver uma aplicação moderna com navegação entre páginas, integração com API, autenticação, estrutura de CRUD, organização de código, testes automatizados e visão de arquitetura full stack.

Como projeto de portfólio, ele evidencia competências relevantes para vagas **júnior em desenvolvimento web** e também **tester/QA júnior**, especialmente por combinar interface, lógica de negócio e automação de testes em um único sistema.