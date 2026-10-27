import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../api'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [modo, setModo] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nome, setNome] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [animating, setAnimating] = useState(false)
  const formWrapRef = useRef(null)

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message)
    }
  }, [location.state])

  const preencherDemo = () => {
    setEmail('gestor@helpdesk.com')
    setPassword('123456')
    setMessage('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setMessage('Preencha e-mail e senha')
      return
    }

    setSubmitting(true)
    try {
      const res = await authApi.login(email, password)
      const usuario = {
        id: res.user.id,
        nome: res.user.name,
        perfil: res.user.role,
        email: res.user.email,
      }
      localStorage.setItem('helpdesk_user', JSON.stringify(usuario))
      setMessage('')
      setEmail('')
      setPassword('')
      navigate('/dashboard')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    if (!nome || !email || !password) {
      setMessage('Preencha todos os campos')
      return
    }

    if (password.length < 4) {
      setMessage('Senha deve ter no mínimo 4 caracteres')
      return
    }

    setSubmitting(true)
    try {
      await authApi.register({ name: nome, email, password })
      setNome('')
      setEmail('')
      setPassword('')
      await alternarModo()
      setMessage('Conta criada com sucesso! Faça login.')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const alternarModo = async () => {
    if (animating) return
    setAnimating(true)
    setMessage('')
    if (formWrapRef.current) {
      formWrapRef.current.classList.add('form-exit')
    }

    await new Promise((r) => setTimeout(r, 180))
    setModo(modo === 'login' ? 'register' : 'login')
    if (formWrapRef.current) {
      formWrapRef.current.classList.remove('form-exit')
      formWrapRef.current.classList.add('form-enter')
    }

    await new Promise((r) => setTimeout(r, 220))
    if (formWrapRef.current) {
      formWrapRef.current.classList.remove('form-enter')
    }
    setAnimating(false)
  }

  return (
    <main className="app login-page" data-cy="login-page">
      <div className="login-shell">
        <aside className="login-brand-panel">
          <div>
            <div className="brand-badge">
              <span className="status-dot" />
              <span>SERVICE DESK & QA OPS</span>
            </div>
            <h2>Controle operacional de chamados de ponta a ponta.</h2>
            <p className="brand-desc">
              Plataforma full-stack para triagem de incidentes, atribuição de responsáveis e
              acompanhamento de status em tempo real.
            </p>
          </div>

          <div className="brand-specs">
            <div className="spec-item">
              <span className="spec-val">3 Camadas</span>
              <span className="spec-lbl">Testes Unit, API & E2E</span>
            </div>
            <div className="spec-item">
              <span className="spec-val">90 Specs</span>
              <span className="spec-lbl">Validadas em CI/CD</span>
            </div>
          </div>
        </aside>

        <section className="login-card">
          <div className="login-header">
            <p className="eyebrow">Service Desk Console</p>
            <h1>HelpDesk Pro</h1>
            <p className="subtitle" key={modo}>
              {modo === 'login'
                ? 'Faça login para gerenciar seus chamados.'
                : 'Crie sua conta e comece a usar o sistema.'}
            </p>
          </div>

          <div className="login-form-wrap" ref={formWrapRef}>
            {modo === 'login' ? (
              <form onSubmit={handleLogin} className="login-form">
                <div className="field">
                  <input
                    id="email"
                    type="email"
                    placeholder=" "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    data-cy="login-email"
                  />
                  <label htmlFor="email">E-mail corporativo</label>
                </div>

                <div className="field">
                  <input
                    id="password"
                    type="password"
                    placeholder=" "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                    data-cy="login-password"
                  />
                  <label htmlFor="password">Senha</label>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                  data-cy="login-submit"
                >
                  {submitting ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="login-form">
                <div className="field">
                  <input
                    id="regNome"
                    type="text"
                    placeholder=" "
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={submitting}
                    data-cy="reg-name"
                  />
                  <label htmlFor="regNome">Nome completo</label>
                </div>

                <div className="field">
                  <input
                    id="regEmail"
                    type="email"
                    placeholder=" "
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    data-cy="reg-email"
                  />
                  <label htmlFor="regEmail">E-mail</label>
                </div>

                <div className="field">
                  <input
                    id="regPassword"
                    type="password"
                    placeholder=" "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                    data-cy="reg-password"
                  />
                  <label htmlFor="regPassword">Senha</label>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                  data-cy="reg-submit"
                >
                  {submitting ? 'Criando...' : 'Criar Conta'}
                </button>
              </form>
            )}
          </div>

          {message && (
            <p className="login-message" data-cy="login-message" key={message}>
              {message}
            </p>
          )}

          <div className="auth-toggle">
            {modo === 'login' ? (
              <p>
                Não tem conta?{' '}
                <button
                  type="button"
                  className="link-btn"
                  onClick={alternarModo}
                  disabled={animating}
                  data-cy="toggle-register"
                >
                  Cadastre-se
                </button>
              </p>
            ) : (
              <p>
                Já tem conta?{' '}
                <button
                  type="button"
                  className="link-btn"
                  onClick={alternarModo}
                  disabled={animating}
                  data-cy="toggle-login"
                >
                  Faça login
                </button>
              </p>
            )}
          </div>

          {modo === 'login' && (
            <div className="hint-box">
              <div className="hint-box-top">
                <strong>Acesso para teste</strong>
                <button
                  type="button"
                  className="btn-fill-demo"
                  onClick={preencherDemo}
                  data-cy="fill-demo"
                >
                  Preencher 1-click
                </button>
              </div>
              <span className="mono-credential">E-mail: gestor@helpdesk.com</span>
              <span className="mono-credential">Senha: 123456</span>
              <span className="hint-note">(usuário pré-cadastrado no banco)</span>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default LoginPage
