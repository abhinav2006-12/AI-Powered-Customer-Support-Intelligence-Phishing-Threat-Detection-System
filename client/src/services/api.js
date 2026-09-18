const API_BASE = '/api';

async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`API Call failed (${url}):`, err.message);
    throw err;
  }
}

export async function getDashboard() {
  return fetchJson('/dashboard');
}

export async function getConversations(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchJson(`/conversations${query ? `?${query}` : ''}`);
}

export async function getConversation(id) {
  return fetchJson(`/conversations/${id}`);
}

export async function createConversation(data) {
  return fetchJson('/conversations', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function deleteConversation(id) {
  return fetchJson(`/conversations/${id}`, {
    method: 'DELETE'
  });
}

export async function analyzeConversation(data) {
  return fetchJson('/analyze', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function reanalyzeConversation(id) {
  return fetchJson(`/analyze/conversations/${id}/analyze`, {
    method: 'POST'
  });
}

export async function getThreats(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchJson(`/threats${query ? `?${query}` : ''}`);
}

export async function getThreat(id) {
  return fetchJson(`/threats/${id}`);
}

export async function getAnalytics(range = '30d') {
  return fetchJson(`/analytics?range=${range}`);
}

export async function getDatasetInfo() {
  return fetchJson('/dataset');
}

export async function importDataset(data) {
  return fetchJson('/dataset/import', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function clearDataset() {
  return fetchJson('/dataset', {
    method: 'DELETE'
  });
}

export async function seedDemoData(count = 60) {
  return fetchJson('/demo/seed', {
    method: 'POST',
    body: JSON.stringify({ count })
  });
}

export async function sendChatMessage(data) {
  return fetchJson('/chat', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function getChatSuggestions() {
  return fetchJson('/chat/suggestions');
}

