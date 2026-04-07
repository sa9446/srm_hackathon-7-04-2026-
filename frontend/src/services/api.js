const BASE_URL = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('gig_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Auth ─────────────────────────────────────────────────────
export const authApi = {
  login:     (body)       => request('/auth/login',       { method: 'POST', body: JSON.stringify(body) }),
  register:  (body)       => request('/auth/register',    { method: 'POST', body: JSON.stringify(body) }),
  faceLogin: (descriptor) => request('/auth/face-login',  { method: 'POST', body: JSON.stringify({ descriptor }) }),
  profile:   ()           => request('/auth/profile'),
};

// ── History ───────────────────────────────────────────────────
export const historyApi = {
  get:    (limit = 30) => request(`/history?limit=${limit}`),
  add:    (body)       => request('/history', { method: 'POST', body: JSON.stringify(body) }),
  remove: (id)         => request(`/history/${id}`, { method: 'DELETE' }),
};

// ── Score ─────────────────────────────────────────────────────
export const scoreApi = {
  get:       () => request('/score'),
  loan:      () => request('/score/loan'),
  insurance: () => request('/score/insurance'),
  recompute: () => request('/score/recompute', { method: 'POST' }),
};

// ── Ride ──────────────────────────────────────────────────────
export const rideApi = {
  status: () => request('/ride/status'),
  start:  () => request('/ride/start', { method: 'POST' }),
  stop:   () => request('/ride/stop',  { method: 'POST' }),
};
