const BASE = '/api';

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || `请求失败 (${res.status})`);
  }
  return res.json();
}

const api = {
  // Projects
  getProjects: () => request('/projects'),
  getProject: (id) => request(`/projects?id=${id}`),
  getProjectStats: (id) => request(`/projects?id=${id}&action=stats`),

  // Stories
  getStories: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/stories${qs ? '?' + qs : ''}`);
  },
  getStory: (id) => request(`/stories?id=${id}`),
  createStory: (data) => request('/stories', { method: 'POST', body: JSON.stringify(data) }),
  updateStory: (id, data) => request(`/stories?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStory: (id) => request(`/stories?id=${id}`, { method: 'DELETE' }),
  batchDeleteStories: (ids) => request(`/stories?ids=${ids.join(',')}`, { method: 'DELETE' }),

  // Tasks
  getTasks: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/tasks${qs ? '?' + qs : ''}`);
  },
  createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/tasks?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  batchUpdateTasks: (updates) => request('/tasks?id=batch', { method: 'PUT', body: JSON.stringify({ updates }) }),
  deleteTask: (id) => request(`/tasks?id=${id}`, { method: 'DELETE' }),

  // Sprints
  getSprints: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/sprints${qs ? '?' + qs : ''}`);
  },
  getSprint: (id) => request(`/sprints?id=${id}`),
  getSprintStats: (id) => request(`/sprints?id=${id}&action=stats`),
  updateSprint: (id, data) => request(`/sprints?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  createSprint: (data) => request('/sprints', { method: 'POST', body: JSON.stringify(data) }),
  deleteSprint: (id) => request(`/sprints?id=${id}`, { method: 'DELETE' }),

  // Standups
  getStandups: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/standups${qs ? '?' + qs : ''}`);
  },
  createStandup: (data) => request('/standups', { method: 'POST', body: JSON.stringify(data) }),
  updateStandup: (id, data) => request(`/standups?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStandup: (id) => request(`/standups?id=${id}`, { method: 'DELETE' }),

  // Risks
  getRisks: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/risks${qs ? '?' + qs : ''}`);
  },
  createRisk: (data) => request('/risks', { method: 'POST', body: JSON.stringify(data) }),
  updateRisk: (id, data) => request(`/risks?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRisk: (id) => request(`/risks?id=${id}`, { method: 'DELETE' }),
  batchDeleteRisks: (ids) => request(`/risks?ids=${ids.join(',')}`, { method: 'DELETE' }),

  // Milestones
  getMilestones: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/milestones${qs ? '?' + qs : ''}`);
  },
  createMilestone: (data) => request('/milestones', { method: 'POST', body: JSON.stringify(data) }),
  updateMilestone: (id, data) => request(`/milestones?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMilestone: (id) => request(`/milestones?id=${id}`, { method: 'DELETE' }),
};

export default api;
