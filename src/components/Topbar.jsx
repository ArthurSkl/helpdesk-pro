import { useNavigate } from 'react-router-dom'
import { useUsuario } from '../hooks/useUsuario'

function Topbar({ subtitle = 'Service Desk Console', title, rightSlot }) {
  const navigate = useNavigate()
  const { getUsuario } = useUsuario()
  const usuarioLogado = getUsuario()

  const handleLogout = () => {
    localStorage.removeItem('helpdesk_user')
    navigate('/login', { state: { message: 'Logout realizado com sucesso' } })
  }

  const initials = (usuarioLogado?.nome || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="brand-mark"
          onClick={() => navigate('/dashboard')}
          title="Ir para o Painel de Chamados"
        >
          <span className="brand-logo">HP</span>
          <div className="brand-titles">
            <span className="eyebrow">{subtitle}</span>
            {title && <h1 data-cy="dashboard-title">{title}</h1>}
          </div>
        </button>
      </div>

      <div className="topbar-actions">
        {rightSlot}

        <div className="user-box" data-cy="user-info">
          <span className="user-avatar">{initials}</span>
          <div className="user-meta">
            <strong>{usuarioLogado?.nome || 'Usuário'}</strong>
            <span>{usuarioLogado?.perfil || 'operador'}</span>
          </div>
        </div>

        <button className="logout-btn" data-cy="logout-button" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </header>
  )
}

export default Topbar
