import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketsApi } from '../api'
import Topbar from '../components/Topbar'

function DashboardSkeleton() {
  return (
    <main className="app dashboard-page" data-cy="dashboard-page">
      <div className="dashboard-container">
        <header className="topbar">
          <div>
            <div className="skeleton skeleton-text" style={{ width: 140, marginBottom: 8 }} />
            <div className="skeleton skeleton-text" style={{ width: 240, height: 28 }} />
          </div>
        </header>

        <section className="metrics">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton skeleton-metric" />
          ))}
        </section>

        <section className="tickets-section">
          <div className="skeleton skeleton-text" style={{ width: 180, marginBottom: 16 }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton skeleton-row" />
          ))}
        </section>
      </div>
    </main>
  )
}

function DashboardPage() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFiltro, setStatusFiltro] = useState('Todos')
  const [busca, setBusca] = useState('')

  const carregar = useCallback(() => {
    setLoading(true)
    ticketsApi
      .list()
      .then((data) => {
        setTickets(Array.isArray(data) ? data : data.tickets ?? [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const metricas = useMemo(() => {
    const abertos = tickets.filter((t) => t.status_name === 'Aberto').length
    const atendimento = tickets.filter((t) => t.status_name === 'Em Atendimento').length
    const resolvidos = tickets.filter((t) => t.status_name === 'Resolvido').length
    const encerrados = tickets.filter((t) => t.status_name === 'Encerrado').length
    const total = tickets.length || 1

    return {
      abertos,
      atendimento,
      resolvidos,
      encerrados,
      pctAbertos: Math.round((abertos / total) * 100),
      pctAtendimento: Math.round((atendimento / total) * 100),
      pctResolvidos: Math.round((resolvidos / total) * 100),
      pctEncerrados: Math.round((encerrados / total) * 100),
    }
  }, [tickets])

  const chamadosFiltrados = useMemo(() => {
    return tickets.filter((t) => {
      const matchStatus = statusFiltro === 'Todos' || t.status_name === statusFiltro
      if (!matchStatus) return false
      if (!busca.trim()) return true
      const q = busca.toLowerCase()
      return (
        t.code?.toLowerCase().includes(q) ||
        t.title?.toLowerCase().includes(q) ||
        t.assignee_name?.toLowerCase().includes(q) ||
        t.category_name?.toLowerCase().includes(q)
      )
    })
  }, [tickets, statusFiltro, busca])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Tem certeza que deseja remover este chamado?')) return
    try {
      await ticketsApi.delete(id)
      carregar()
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleCardFilter = (status) => {
    setStatusFiltro((prev) => (prev === status ? 'Todos' : status))
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

  if (loading) return <DashboardSkeleton />

  if (error && tickets.length === 0) {
    return (
      <main className="app dashboard-page" data-cy="dashboard-page">
        <div className="dashboard-container">
          <div className="error-state">
            <div className="error-icon">!</div>
            <p className="error-text">{error}</p>
            <button className="btn-new" onClick={carregar}>
              Tentar novamente
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="app dashboard-page" data-cy="dashboard-page">
      <div className="dashboard-container">
        <Topbar subtitle="HelpDesk Pro // Operações" title="Painel de Chamados" />

        <section className="metrics">
          <div
            className={`metric-card metric-warning ${statusFiltro === 'Aberto' ? 'metric-active' : ''}`}
            data-cy="metric-abertos"
            onClick={() => toggleCardFilter('Aberto')}
            title="Clique para filtrar por Abertos"
          >
            <div className="metric-top">
              <span>Abertos</span>
              <small className="metric-pct">{metricas.pctAbertos}%</small>
            </div>
            <strong>{metricas.abertos}</strong>
            <div className="metric-bar">
              <div className="metric-bar-fill" style={{ width: `${metricas.pctAbertos}%` }} />
            </div>
          </div>

          <div
            className={`metric-card metric-info ${statusFiltro === 'Em Atendimento' ? 'metric-active' : ''}`}
            data-cy="metric-atendimento"
            onClick={() => toggleCardFilter('Em Atendimento')}
            title="Clique para filtrar por Em Atendimento"
          >
            <div className="metric-top">
              <span>Em atendimento</span>
              <small className="metric-pct">{metricas.pctAtendimento}%</small>
            </div>
            <strong>{metricas.atendimento}</strong>
            <div className="metric-bar">
              <div className="metric-bar-fill" style={{ width: `${metricas.pctAtendimento}%` }} />
            </div>
          </div>

          <div
            className={`metric-card metric-success ${statusFiltro === 'Resolvido' ? 'metric-active' : ''}`}
            data-cy="metric-resolvidos"
            onClick={() => toggleCardFilter('Resolvido')}
            title="Clique para filtrar por Resolvidos"
          >
            <div className="metric-top">
              <span>Resolvidos</span>
              <small className="metric-pct">{metricas.pctResolvidos}%</small>
            </div>
            <strong>{metricas.resolvidos}</strong>
            <div className="metric-bar">
              <div className="metric-bar-fill" style={{ width: `${metricas.pctResolvidos}%` }} />
            </div>
          </div>

          <div
            className={`metric-card metric-neutral ${statusFiltro === 'Encerrado' ? 'metric-active' : ''}`}
            data-cy="metric-encerrados"
            onClick={() => toggleCardFilter('Encerrado')}
            title="Clique para filtrar por Encerrados"
          >
            <div className="metric-top">
              <span>Encerrados</span>
              <small className="metric-pct">{metricas.pctEncerrados}%</small>
            </div>
            <strong>{metricas.encerrados}</strong>
            <div className="metric-bar">
              <div className="metric-bar-fill" style={{ width: `${metricas.pctEncerrados}%` }} />
            </div>
          </div>
        </section>

        <section className="tickets-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Fila de Atendimento</p>
              <h2 data-cy="tickets-title">Chamados recentes</h2>
            </div>

            <div className="filters-row">
              <div className="search-box">
                <label htmlFor="buscaChamado">Buscar na fila</label>
                <input
                  id="buscaChamado"
                  type="search"
                  placeholder="Código, título ou responsável..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  data-cy="search-input"
                />
              </div>

              <div className="filters-box">
                <label htmlFor="statusFiltro">Filtrar por status</label>
                <select
                  id="statusFiltro"
                  value={statusFiltro}
                  onChange={(e) => setStatusFiltro(e.target.value)}
                  data-cy="status-filter"
                >
                  <option>Todos</option>
                  <option>Aberto</option>
                  <option>Em Atendimento</option>
                  <option>Resolvido</option>
                  <option>Encerrado</option>
                </select>
              </div>

              <button
                className="btn-new"
                onClick={() => navigate('/tickets/new')}
                data-cy="btn-new-ticket"
              >
                + Novo Chamado
              </button>
            </div>
          </div>

          <div className="results-bar">
            <p className="results-info" data-cy="results-count">
              {chamadosFiltrados.length} chamado(s) encontrado(s)
            </p>
            {(statusFiltro !== 'Todos' || busca.trim() !== '') && (
              <button
                type="button"
                className="btn-clear-filter"
                onClick={() => {
                  setStatusFiltro('Todos')
                  setBusca('')
                }}
              >
                Limpar filtros ({statusFiltro})
              </button>
            )}
          </div>

          <div className="table-wrapper">
            <table data-cy="tickets-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Título</th>
                  <th>Status</th>
                  <th>Prioridade</th>
                  <th>Responsável</th>
                  <th className="th-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {chamadosFiltrados.map((chamado) => (
                  <tr
                    key={chamado.id}
                    data-cy="ticket-row"
                    className="clickable-row"
                    onClick={() => navigate(`/tickets/${chamado.id}`)}
                  >
                    <td>
                      <strong className="ticket-code-pill">{chamado.code}</strong>
                    </td>
                    <td className="td-title">{chamado.title}</td>
                    <td>
                      <span className={getStatusClass(chamado.status_name)}>
                        {chamado.status_name}
                      </span>
                    </td>
                    <td>
                      <span className={getPriorityClass(chamado.priority_name)}>
                        {chamado.priority_name}
                      </span>
                    </td>
                    <td>
                      <span className="assignee-chip">
                        <span className="assignee-dot" />
                        {chamado.assignee_name || 'Não atribuído'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn-icon btn-icon-edit"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/tickets/${chamado.id}/edit`)
                          }}
                          data-cy="btn-edit"
                          title="Editar"
                        >
                          Editar
                        </button>
                        <button
                          className="btn-icon btn-icon-delete"
                          onClick={(e) => handleDelete(chamado.id, e)}
                          data-cy="btn-delete"
                          title="Remover"
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

export default DashboardPage
