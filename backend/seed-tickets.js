const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '123',
  database: process.env.PGDATABASE || 'Help-Desk',
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
})

const titulos = [
  'Computador não liga',
  'E-mail corporativo não recebe anexos',
  'Acesso ao VPN instável',
  'Impressora sem toner',
  'Sistema lento após atualização',
  'Teclado com falha em teclas específicas',
  'Monitor piscando intermitentemente',
  'Mouse duplo clique',
  'Cabo de rede danificado',
  'Fonte queimada',
  'HD externo não reconhecido',
  'Webcam não funciona no Teams',
  'Microfone com ruído',
  'Bateria do notebook não carrega',
  'Tela azul ao iniciar Windows',
  'Acesso negado ao sistema interno',
  'Senha expirada sem conseguir redefinir',
  'Pastas compartilhadas inacessíveis',
  'Certificado SSL expirado',
  'Aplicativo não abre após atualização',
  'Banco de dados lento em horário crítico',
  'Servidor de arquivos fora do ar',
  'Backup automático não está rodando',
  'Firewall bloqueando porta necessária',
  'Erro 500 ao acessar portal RH',
  'Relatório financeiro não exporta',
  'Sistema de ponto não registra horário',
  'Nota fiscal não emite',
  'Acesso ao Wi-Fi corporativo falhando',
  'VPN desconectando a cada 30 minutos',
  'Login no sistema com delay de 10s',
  'Botão de envio do formulário sem resposta',
  'Campo de data exibindo formato errado',
  'Notificação push não chega no celular',
  'QR code da sala de reunião não lê',
  'Projetor não conecta no notebook',
  'Caixa de som sem áudio',
  'Nobre apitando constantemente',
  'Tomada da sala 302 sem energia',
  'Ar condicionado da sala de servidores desligou',
  'Servidor DNS não responde',
  'DHCP não está atribuindo IP',
  'Site corporativo offline',
  'API de pagamento retornando timeout',
  'Logs do sistema cheios de erro',
  'Usuário não consegue alterar própria senha',
  'Cadastro duplicado no sistema',
  'Perfil de acesso incorreto',
  'Sessão expirando antes do tempo',
  'Token JWT inválido após refresh',
  'Upload de arquivo trava em 90%',
  'Download de relatório corrompido',
  'Sistema não envia e-mail de recuperação',
  'Chat interno offline',
  'Videoconferência sem transmissão de áudio',
  'Compartilhamento de tela com lag',
  'Anexo do chamado não abre',
  'Campo de busca sem retorno',
  'Filtro avançado não funciona',
  'Ordenação da tabela invertida',
  'Gráfico do dashboard não renderiza',
  'Menu lateral desapareceu',
  'Botão de salvar desabilitado',
  'Formulário fecha sem aviso ao recarregar',
  'Timeout na consulta de tickets',
  'Notificação de novo chamado não aparece',
  'Badge de contagem com número errado',
  'Responsável do ticket não atualiza',
  'Prioridade do ticket alterou sozinha',
  'Status pulou etapas indevidamente',
  'Código do ticket repetido',
  'Data de criação incorreta',
  'Descrição sumiu após editar',
  'Solicitante não encontra ticket aberto',
  'Responsável não recebeu notificação',
  'SLA estourado sem alerta',
  'Tempo de resposta não calculado',
  'Relatório de produtividade zerado',
  'Gráfico de pizza com fatias erradas',
  'Exportação de CSV com encoding quebrado',
  'PDF do chamado com formatação errada',
  'Impressão corta borda direita',
  'Scanner não salva em PDF',
  'Digitalizadora com linhas no meio',
  'Biometria não reconhece digital',
  'Cartão de acesso desativado',
  'Catraca não libera passagem',
  'Câmera de segurança offline',
  'Sensor de presença com falsos disparos',
  'Alarme disparou sem motivo',
  'Porta da sala 105 não abre',
  'Elevador parou entre andares',
  'Interfone sem áudio',
  'Sirene de emergência não testa',
  'Extintor com validade vencida',
  'Lâmpada da sala 204 queimada',
  'Fiação exposta no corredor',
  'Tomada da copa solta',
  'Ralo da cozinha entupido',
  'Bebedouro sem gelar',
  'Febre amarela - atualizar certificado',
]

const descricoes = [
  'Usuário reporta que {]. O problema começou hoje pela manhã logo após o início do expediente.',
  '{] conforme relato do colaborador. Já foram realizadas as verificações básicas sem sucesso.',
  'Solicitamos suporte pois {]. Impacta diretamente a produtividade da equipe.',
  'Identificamos que {]. Necessário análise técnica para determinar a causa raiz.',
  'Desde ontem, {]. Tentamos reiniciar o equipamento mas o problema persiste.',
]

const nomes = [
  'Ana Beatriz', 'Carlos Eduardo', 'Diana Ferreira', 'Eduardo Lima',
  'Fernanda Santos', 'Gabriel Oliveira', 'Helena Costa', 'Igor Martins',
  'Julia Pereira', 'Lucas Almeida', 'Marina Rocha', 'Nathan Barbosa',
  'Olivia Campos', 'Pedro Henrique', 'Rafaela Dias', 'Samuel Teixeira',
  'Tatiana Nunes', 'Ubirajara Melo', 'Vanessa Araujo', 'William Correia',
]

const equipes = ['Suporte N1', 'Suporte N2', 'Infraestrutura', 'Redes', 'Desenvolvimento', 'DBA', 'Segurança']

function pick(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function randomDate(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo))
  d.setHours(Math.floor(Math.random() * 12) + 8)
  d.setMinutes(Math.floor(Math.random() * 60))
  return d.toISOString()
}

function makeDescription(template, title) {
  const lower = title.charAt(0).toLowerCase() + title.slice(1)
  return template.replace('{]', lower)
}

async function seedTickets() {
  const client = await pool.connect()
  try {
    console.log('Verificando usuarios...')
    const usersResult = await client.query("SELECT id, name FROM users WHERE is_active = true ORDER BY id")
    let users = usersResult.rows

    while (users.length < 15) {
      const name = nomes[users.length % nomes.length]
      const email = `${name.toLowerCase().replaceAll(' ', '.')}@empresa.com`
      await client.query(
        `INSERT INTO users (name, email, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (email) DO NOTHING`,
        [name, email, '$2a$10$fakehashplaceholder', 'requester']
      )
      console.log(`  Usuario criado: ${name}`)
      users = (await client.query("SELECT id, name FROM users WHERE is_active = true ORDER BY id")).rows
    }

    const adminsResult = await client.query("SELECT id, name FROM users WHERE role = 'admin' LIMIT 2")
    const admins = adminsResult.rows
    if (admins.length === 0) {
      console.log('Nenhum admin encontrado, execute npm run setup-db primeiro.')
      return
    }

    const statuses = await client.query('SELECT id, name FROM ticket_statuses')
    const priorities = await client.query('SELECT id, name FROM ticket_priorities')
    const categories = await client.query('SELECT id, name FROM ticket_categories')

    const statusMap = Object.fromEntries(statuses.rows.map(r => [r.name, r.id]))
    const priorityIds = priorities.rows.map(r => r.id)
    const categoryIds = categories.rows.map(r => r.id)

    if (Object.keys(statusMap).length === 0 || priorityIds.length === 0 || categoryIds.length === 0) {
      console.log('Tabelas de lookup vazias. Execute npm run setup-db primeiro.')
      return
    }

    const sidAberto = statusMap['Aberto']
    const sidAtendimento = statusMap['Em Atendimento']
    const sidResolvido = statusMap['Resolvido']
    const sidEncerrado = statusMap['Encerrado']

    if (!sidAberto || !sidAtendimento || !sidResolvido || !sidEncerrado) {
      console.log('Status necessarios nao encontrados. Execute npm run setup-db primeiro.')
      return
    }

    console.log(`\nInserindo ${titulos.length} chamados...`)

    for (let i = 0; i < titulos.length; i++) {
      const title = titulos[i]
      const requester = pick(users)
      const assignee = Math.random() > 0.2 ? pick(admins) : null
      const statusId = i < 30 ? sidAberto : i < 55 ? sidAtendimento : i < 80 ? sidResolvido : sidEncerrado
      const priorityId = pick(priorityIds)
      const categoryId = pick(categoryIds)
      const descTemplate = pick(descricoes)
      const description = makeDescription(descTemplate, title)
      const createdAt = randomDate(60)
      const updatedAt = new Date(new Date(createdAt).getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()

      const insertResult = await client.query(
        `INSERT INTO tickets (title, description, requester_id, assignee_id, category_id, status_id, priority_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [title, description, requester.id, assignee?.id || null, categoryId, statusId, priorityId, createdAt, updatedAt]
      )

      const ticketId = insertResult.rows[0].id
      const code = `TKT-${String(ticketId).padStart(3, '0')}`
      await client.query('UPDATE tickets SET code = $1 WHERE id = $2', [code, ticketId])
    }

    const total = await client.query('SELECT COUNT(*) FROM tickets')
    console.log(`\nConcluido! ${total.rows[0].count} chamados no banco.`)
  } catch (err) {
    console.error('Erro:', err.message)
  } finally {
    client.release()
    await pool.end()
  }
}

seedTickets()
