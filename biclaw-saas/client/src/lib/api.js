const BASE = '/api';

function getToken() { return localStorage.getItem('biclaw_token'); }

async function req(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

export const api = {
  // Auth
  register: (body) => req('/auth/register', { method: 'POST', body }),
  login: (body) => req('/auth/login', { method: 'POST', body }),
  me: () => req('/auth/me'),
  updateProfile: (body) => req('/auth/profile', { method: 'PUT', body }),

  // Billing
  plans: () => req('/billing/plans'),
  checkout: (planId) => req('/billing/checkout', { method: 'POST', body: { planId } }),
  portal: () => req('/billing/portal', { method: 'POST' }),

  // Agents
  scan: (url) => req('/agents/scan', { method: 'POST', body: { url } }),
  runAgent: (agentId, prompt) => req('/agents/run', { method: 'POST', body: { agentId, prompt } }),
  saveSession: (data) => req('/agents/sessions', { method: 'POST', body: data }),
  getSessions: () => req('/agents/sessions'),
  getSession: (id) => req(`/agents/sessions/${id}`),
  usage: () => req('/agents/usage'),
  getTrends: () => req('/agents/trends'),

  // A/B Tests
  getABTests: () => req('/agents/ab'),
  createABTest: (name) => req('/agents/ab', { method: 'POST', body: { name } }),
  updateABTest: (id, data) => req(`/agents/ab/${id}`, { method: 'PUT', body: data }),
  deleteABTest: (id) => req(`/agents/ab/${id}`, { method: 'DELETE' }),
};
