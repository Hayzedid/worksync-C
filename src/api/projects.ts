import { api } from '../api';

export async function getProjects(params?: Record<string, unknown>) {
  return api.get('/projects', { params });
}
