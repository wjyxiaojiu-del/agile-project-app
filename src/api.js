const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const api = {
  // Projects
  getProjects: () => request('/projects'),
  getProject: (id) => request(`/projects/${id}`),
  getProjectStats: (id) => request(`/projects/${id}/stats`),

  // Stories
  getStories: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/stories${qs ? '?' + qs : ''}`);
  },
  getStory: (id) => request(`/stories/${id}`),
  createStory: (data) => request('/stories', { method: 'POST', body: JSON.stringify(data) }),
  updateStory: (id, data) => request(`/stories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStory: (id) => request(`/stories/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/tasks${qs ? '?' + qs : ''}`);
  },
  createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  batchUpdateTasks: (updates) => request('/tasks/batch/status', { method: 'PUT', body: JSON.stringify({ updates }) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Sprints
  getSprints: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/sprints${qs ? '?' + qs : ''}`);
  },
  getSprint: (id) => request(`/sprints/${id}`),
  getSprintStats: (id) => request(`/sprints/${id}/stats`),
  updateSprint: (id, data) => request(`/sprints/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Standups
  getStandups: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/standups${qs ? '?' + qs : ''}`);
  },
  createStandup: (data) => request('/standups', { method: 'POST', body: JSON.stringify(data) }),
  updateStandup: (id, data) => request(`/standups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStandup: (id) => request(`/standups/${id}`, { method: 'DELETE' }),

  // Risks
  getRisks: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/risks${qs ? '?' + qs : ''}`);
  },
  createRisk: (data) => request('/risks', { method: 'POST', body: JSON.stringify(data) }),
  updateRisk: (id, data) => request(`/risks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRisk: (id) => request(`/risks/${id}`, { method: 'DELETE' }),
};

export default api;
