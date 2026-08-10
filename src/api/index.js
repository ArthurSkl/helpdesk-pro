const API_BASE = 'https://helpdesk-pro-api.onrender.com';

async function request(endpoint, options = {}) {
  let res
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.')
  }

  if (!res.ok) {
    const text = await res.text()
    let error
    try {
      error = JSON.parse(text)
    } catch {
      error = { message: `Erro ${res.status}: ${text.slice(0, 200)}` }
    }
    throw new Error(error.message || `HTTP ${res.status}`)
  }

  return res.json();
}

export const ticketsApi = {
  list() {
    return request('/tickets');
  },

  getById(id) {
    return request(`/tickets/${id}`);
  },

  create(data) {
    return request('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id, data) {
    return request(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(id) {
    return request(`/tickets/${id}`, {
      method: 'DELETE',
    });
  },
};

export const authApi = {
  login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(data) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const referencesApi = {
  statuses() {
    return request('/references/statuses');
  },
  priorities() {
    return request('/references/priorities');
  },
  categories() {
    return request('/references/categories');
  },
  users() {
    return request('/references/users');
  },
};
