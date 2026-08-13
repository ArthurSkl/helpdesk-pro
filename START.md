# Comandos do projeto HelpDesk Pro

## 1) Frontend

Na raiz do projeto:

```bash
npm install
npm run dev
```

Abra no navegador: http://localhost:5173/

## 2) Backend

```bash
cd backend
npm install
npm run dev
```

A API fica disponível em: http://localhost:3001/

## 3) Cypress

Na raiz do projeto (onde está o `cypress.config.js`):

```bash
npm run cy:open   # abre a interface interativa
npm run cy:run    # executa em modo headless
```

OBS:
- Não rodar dentro da pasta `cypress`.
- O frontend precisa estar rodando para os testes funcionarem.
- Se a porta 5173 não abrir, verifique se o frontend realmente subiu ou se mudou para outra porta.
