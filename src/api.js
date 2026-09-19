const API_BASE = import.meta.env.VITE_API_BASE || '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `HTTP_${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export const api = {
  login: (code) => request('/api/auth/login', { method:'POST', body:JSON.stringify({code}) }),
  me: () => request('/api/auth/me'),
  logout: () => request('/api/auth/logout', { method:'POST' }),
  qr: (token) => request(`/api/qr/${encodeURIComponent(token)}`),
  createQr: (labId) => request('/api/qr', { method:'POST', body:JSON.stringify({labId}) }),
  lab: (labId) => request(`/api/labs/${encodeURIComponent(labId)}`),
  schedule: (labId,date) => request(`/api/labs/${encodeURIComponent(labId)}/schedule?date=${encodeURIComponent(date)}`),
  createJournal: (payload) => request('/api/journals', { method:'POST', body:JSON.stringify(payload) }),
  myJournals: () => request('/api/journals/me'),
  journals: () => request('/api/journals'),
  journal: (id) => request(`/api/journals/${encodeURIComponent(id)}`),
  updateJournal: (id,payload) => request(`/api/journals/${encodeURIComponent(id)}`, { method:'PATCH', body:JSON.stringify(payload) }),
  resubmit: (id) => request(`/api/journals/${encodeURIComponent(id)}/resubmit`, { method:'POST' }),
  reviews: (id) => request(`/api/journals/${encodeURIComponent(id)}/reviews`),
  review: (id,payload) => request(`/api/journals/${encodeURIComponent(id)}/reviews`, { method:'POST', body:JSON.stringify(payload) }),
};
