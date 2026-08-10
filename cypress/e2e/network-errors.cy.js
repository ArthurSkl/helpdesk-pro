describe('Redes negativas - falha na API', () => {
  beforeEach(() => {
    cy.clearAllLocalStorage()
  })

  it('exibe mensagem de erro ao tentar login com servidor indisponível', () => {
    cy.intercept('POST', '/api/auth/login', { forceNetworkError: true }).as('loginNetworkError')

    cy.visit('/login')
    cy.get('[data-cy="login-email"]').type('gestor@helpdesk.com')
    cy.get('[data-cy="login-password"]').type('123456')
    cy.get('[data-cy="login-submit"]').click()

    cy.wait('@loginNetworkError')
    cy.get('[data-cy="login-message"]').should('contain.text', 'Não foi possível conectar ao servidor')
    cy.url().should('include', '/login')
  })

  it('exibe mensagem de erro ao tentar login com erro 500', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 500,
      body: { ok: false, message: 'Erro ao fazer login' },
    }).as('loginServerError')

    cy.visit('/login')
    cy.get('[data-cy="login-email"]').type('gestor@helpdesk.com')
    cy.get('[data-cy="login-password"]').type('123456')
    cy.get('[data-cy="login-submit"]').click()

    cy.wait('@loginServerError')
    cy.get('[data-cy="login-message"]').should('contain.text', 'Erro ao fazer login')
    cy.url().should('include', '/login')
  })

  it('exibe estado de erro na dashboard quando a API de tickets falha', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { ok: true, user: { id: 1, name: 'Gestor', email: 'gestor@helpdesk.com', role: 'admin' } },
    }).as('loginOk')
    cy.intercept('GET', '/api/tickets', { forceNetworkError: true }).as('ticketsNetworkError')

    cy.visit('/login')
    cy.get('[data-cy="login-email"]').type('gestor@helpdesk.com')
    cy.get('[data-cy="login-password"]').type('123456')
    cy.get('[data-cy="login-submit"]').click()
    cy.wait('@loginOk')

    cy.wait('@ticketsNetworkError')
    cy.get('[data-cy="dashboard-page"]').should('be.visible')
    cy.get('.error-text').should('contain.text', 'Não foi possível conectar ao servidor')
    cy.get('.error-state').should('contain.text', 'Tentar novamente')
  })

  it('exibe estado de erro na dashboard com erro 500 nos tickets', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { ok: true, user: { id: 1, name: 'Gestor', email: 'gestor@helpdesk.com', role: 'admin' } },
    }).as('loginOk')
    cy.intercept('GET', '/api/tickets', {
      statusCode: 500,
      body: { ok: false, message: 'Erro ao buscar tickets' },
    }).as('ticketsServerError')

    cy.visit('/login')
    cy.get('[data-cy="login-email"]').type('gestor@helpdesk.com')
    cy.get('[data-cy="login-password"]').type('123456')
    cy.get('[data-cy="login-submit"]').click()
    cy.wait('@loginOk')

    cy.wait('@ticketsServerError')
    cy.get('[data-cy="dashboard-page"]').should('be.visible')
    cy.get('.error-text').should('contain.text', 'Erro ao buscar tickets')
    cy.get('.error-state').should('contain.text', 'Tentar novamente')
  })
})
