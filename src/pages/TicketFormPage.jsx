import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ticketsApi, referencesApi } from '../api'
import { useUsuario } from '../hooks/useUsuario'
import Topbar from '../components/Topbar'

function generateTicketCode() {
  const num = Math.floor(100 + Math.random() * 900)
  return `TKT-${num}`
}

function TicketFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [statuses, setStatuses] = useState([])
  const [priorities, setPriorities] = useState([])
  const [categories, setCategories] = useState([])
  const [users, setUsers] = useState([])

  const { getUsuario } = useUsuario()
  const usuarioLogado = getUsuario() || {}

  const defaultRequesterId = usuarioLogado.id?.toString() || '1'

  const [form, setForm] = useState({
    code: isEditing ? '' : generateTicketCode(),
    title: '',
    description: '',
    requester_id: defaultRequesterId,
    assignee_id: '',
    category_id: '',
    status_id: '',
    priority_id: '',
  })

  useEffect(() => {
    Promise.all([
      referencesApi.statuses(),
      referencesApi.priorities(),
      referencesApi.categories(),
      referencesApi.users(),
    ])
      .then(([s, p, c, u]) => {
        setStatuses(s)
        setPriorities(p)
        setCategories(c)
        setUsers(u)
      })
      .catch(() => setError('Erro ao carregar dados do formulário'))

    if (isEditing) {
      ticketsApi
        .getById(id)
        .then((res) => {
          const t = res.ticket
          setForm({
            code: t.code || '',
            title: t.title || '',
            description: t.description || '',
            requester_id: t.requester_id?.toString() || usuarioLogado.id?.toString() || '',
            assignee_id: t.assignee_id?.toString() || '',
            category_id: t.category_id?.toString() || '',
            status_id: t.status_id?.toString() || '',
            priority_id: t.priority_id?.toString() || '',
          })
        })
        .catch(() => setError('Erro ao carregar ticket'))
        .finally(() => setLoading(false))
    }
  }, [id, isEditing])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      ...form,
      code: form.code || generateTicketCode(),
      requester_id: Number(form.requester_id),
      assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
      category_id: Number(form.category_id),
      status_id: Number(form.status_id),
      priority_id: Number(form.priority_id),
    }

    try {
      if (isEditing) {
        await ticketsApi.update(id, payload)
      } else {
        await ticketsApi.create(payload)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="app form-page" data-cy="form-page">
        <p className="loading-text">Carregando...</p>
      </main>
    )
  }

  return (
    <main className="app form-page" data-cy="form-page">
      <div className="dashboard-container">
        <Topbar subtitle="HelpDesk Pro // Registro de Chamado" />

        <nav className="breadcrumb-bar">
          <button
            type="button"
            className="breadcrumb-link"
            onClick={() => navigate('/dashboard')}
          >
            ← Painel de Chamados
          </button>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">
            {isEditing ? `Editar ${form.code}` : 'Novo Chamado'}
          </span>
        </nav>

        <div className="form-card">
          <div className="form-card-header">
            <div>
              <p className="eyebrow">Formulário de Atendimento</p>
              <h1>{isEditing ? 'Editar Chamado' : 'Novo Chamado'}</h1>
            </div>
            {form.code && <span className="ticket-code-pill">{form.code}</span>}
          </div>

          {error && <p className="form-error">{error}</p>}

          <form onSubmit={handleSubmit} className="ticket-form">
            <div className="form-group">
              <label htmlFor="title">Título *</label>
              <input
                id="title"
                name="title"
                placeholder="Resumo objetivo do incidente ou solicitação"
                value={form.title}
                onChange={handleChange}
                required
                data-cy="form-title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Descrição *</label>
              <textarea
                id="description"
                name="description"
                placeholder="Descreva os sintomas, passos para reproduzir e impacto..."
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                data-cy="form-description"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category_id">Categoria *</label>
                <select
                  id="category_id"
                  name="category_id"
                  value={form.category_id}
                  onChange={handleChange}
                  required
                  data-cy="form-category"
                >
                  <option value="">Selecione</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority_id">Prioridade *</label>
                <select
                  id="priority_id"
                  name="priority_id"
                  value={form.priority_id}
                  onChange={handleChange}
                  required
                  data-cy="form-priority"
                >
                  <option value="">Selecione</option>
                  {priorities.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status_id">Status *</label>
                <select
                  id="status_id"
                  name="status_id"
                  value={form.status_id}
                  onChange={handleChange}
                  required
                  data-cy="form-status"
                >
                  <option value="">Selecione</option>
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="assignee_id">Responsável</label>
                <select
                  id="assignee_id"
                  name="assignee_id"
                  value={form.assignee_id}
                  onChange={handleChange}
                  data-cy="form-assignee"
                >
                  <option value="">Não atribuído</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/dashboard')}
                data-cy="form-cancel"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={saving}
                data-cy="form-submit"
              >
                {saving ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar Chamado'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

export default TicketFormPage
