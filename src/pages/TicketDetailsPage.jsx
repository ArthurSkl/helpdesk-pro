import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ticketsApi } from '../api'
import Topbar from '../components/Topbar'

const LIFECYCLE_STEPS = ['Aberto', 'Em Atendimento', 'Resolvido', 'Encerrado']

function TicketDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    ticketsApi
      .getById(id)
      .then((res) => setTicket(res.ticket))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja remover este chamado?')) return
    setDeleting(true)
    try {
      await ticketsApi.delete(id)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('pt-BR')
  }

  const getStatusClass = (status = '') => {
    return `badge status-${status.toLowerCase().replaceAll(' ', '-')}`
  }

  const getPriorityClass = (priority = '') => {
    const p = priority.toLowerCase()
    if (p.includes('alta') || p.includes('crítica') || p.includes('critica')) return 'prio-pill prio-alta'
    if (p.includes('média') || p.includes('media')) return 'prio-pill prio-media'
    return 'prio-pill prio-baixa'
  }

  if (loading) {
    return (
      <main className="app detail-page" data-cy="detail-page">
        <p className="loading-text">Carregando...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="app detail-page" data-cy="detail-page">
        <p className="error-text">Erro: {error}</p>
        <button className="btn-cancel" onClick={() => navigate('/dashboard')}>
          Voltar
        </button>
      </main>
    )
  }

  if (!ticket) {
    return (
      <main className="app detail-page" data-cy="detail-page">
        <p className="error-text">Chamado não encontrado</p>
        <button className="btn-cancel" onClick={() => navigate('/dashboard')}>
          Voltar
        </button>
      </main>
    )
  }

  const currentStepIndex = Math.max(0, LIFECYCLE_STEPS.indexOf(ticket.status_name))

  return (
    <main className="app detail-page" data-cy="detail-page">
      <div className="dashboard-container">
        <Topbar subtitle="HelpDesk Pro // Inspeção de Incidente" />

        <nav className="breadcrumb-bar">
          <button
            type="button"
            className="breadcrumb-link"
            onClick={() => navigate('/dashboard')}
          >
            ← Painel de Chamados
          </button>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{ticket.code}</span>
        </nav>

        <div className="detail-card">
          <div className="detail-header">
            <div>
              <p className="eyebrow">Registro de Chamado</p>
              <h1 data-cy="detail-title">{ticket.code}</h1>
            </div>
            <div className="detail-badges">
              <span className={getPriorityClass(ticket.priority_name)}>
                Prioridade {ticket.priority_name}
              </span>
              <span className={getStatusClass(ticket.status_name)}>{ticket.status_name}</span>
            </div>
          </div>

          <h2 className="detail-subject">{ticket.title}</h2>

          {/* Barra de Progresso do Ciclo de Vida do Chamado */}
          <div className="lifecycle-bar">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const done = idx <= currentStepIndex
              const current = idx === currentStepIndex
              return (
                <div
                  key={step}
                  className={`lifecycle-step ${done ? 'step-done' : ''} ${current ? 'step-current' : ''}`}
                >
                  <span className="step-index">{idx + 1}</span>
                  <span className="step-name">{step}</span>
                </div>
              )
            })}
          </div>

          <div className="detail-layout">
            <div className="detail-main">
              <div className="detail-description">
                <span className="detail-label">Descrição Técnica do Chamado</span>
                <p>{ticket.description}</p>
              </div>
            </div>

            <aside className="detail-sidebar">
              <div className="detail-grid">
                <div className="detail-field">
                  <span className="detail-label">Categoria</span>
                  <span>{ticket.category_name}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Prioridade</span>
                  <span>{ticket.priority_name}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Solicitante</span>
                  <span>{ticket.requester_name}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Responsável</span>
                  <span>{ticket.assignee_name || 'Não atribuído'}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Criado em</span>
                  <span className="mono-date">{formatDate(ticket.created_at)}</span>
                </div>
                <div className="detail-field">
                  <span className="detail-label">Atualizado em</span>
                  <span className="mono-date">{formatDate(ticket.updated_at)}</span>
                </div>
                {ticket.resolved_at && (
                  <div className="detail-field">
                    <span className="detail-label">Resolvido em</span>
                    <span className="mono-date">{formatDate(ticket.resolved_at)}</span>
                  </div>
                )}
                {ticket.closed_at && (
                  <div className="detail-field">
                    <span className="detail-label">Encerrado em</span>
                    <span className="mono-date">{formatDate(ticket.closed_at)}</span>
                  </div>
                )}
              </div>
            </aside>
          </div>

          <div className="detail-actions">
            <button
              className="btn-cancel"
              onClick={() => navigate('/dashboard')}
              data-cy="detail-back"
            >
              Voltar
            </button>
            <div className="detail-actions-right">
              <button
                className="btn-edit"
                onClick={() => navigate(`/tickets/${ticket.id}/edit`)}
                data-cy="detail-edit"
              >
                Editar
              </button>
              <button
                className="btn-delete"
                onClick={handleDelete}
                disabled={deleting}
                data-cy="detail-delete"
              >
                {deleting ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default TicketDetailsPage
