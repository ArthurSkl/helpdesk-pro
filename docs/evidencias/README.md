# Evidências de Teste

Esta pasta guarda as evidências de execução dos testes para auditoria e demonstração.

## Como gerar as evidências

### Testes E2E (Cypress)

1. Suba o backend e o frontend (veja `start project.txt`).
2. Execute a suíte E2E:

   ```bash
   npm run cy:run
   ```

3. O Cypress salva automaticamente:
   - **Screenshots de falhas** em `cypress/screenshots/`
   - **Vídeos da execução** em `cypress/videos/`
   - **Screenshots de cada passo** em `cypress/screenshots/` (captura após cada teste)

4. Copie os arquivos relevantes para esta pasta:

   ```bash
   # exemplo (PowerShell)
   Copy-Item cypress/screenshots/** ./docs/evidencias/screenshots/ -Recurse
   Copy-Item cypress/videos/* ./docs/evidencias/videos/
   ```

5. Rode `git add docs/evidencias && git commit` para publicar no GitHub.

### Testes de API (backend)

1. Execute a suíte de API:

   ```bash
   cd backend
   npm test
   ```

2. O resultado aparece no terminal (formato TAP). Para gerar um arquivo:

   ```bash
   npm test > ../docs/evidencias/api/api-tests.txt
   ```

## Estrutura

- `screenshots/` - capturas de tela (passos e falhas)
- `videos/` - gravações das execuções E2E
- `api/` - relatórios e saída dos testes de API
