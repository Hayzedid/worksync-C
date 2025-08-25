import { api } from '../api';

export async function getProjects(params?: Record<string, any>) {
  return api.get('/projects', { params });
}
