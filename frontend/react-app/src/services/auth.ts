// src/services/auth.ts
import api from '../utils/api';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  console.log('[auth.login] POST /auth/login ➡️', { email, password });
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
  console.log('[auth.login] ← response', data);
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  return data;
}

export async function refreshToken(): Promise<{ access_token: string }> {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('Refresh token missing');
  console.log('[auth.refreshToken] POST /auth/refresh');
  const { data } = await api.post<{ access_token: string }>(
    '/auth/refresh',
    {},
    { headers: { Authorization: `Bearer ${refresh}` } }
  );
  console.log('[auth.refreshToken] ← response', data);
  localStorage.setItem('access_token', data.access_token);
  return data;
}

export async function logout(): Promise<void> {
  console.log('[auth.logout] POST /auth/logout');
  try {
    await api.post('/auth/logout', null);
  } catch {
    // ignore
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  }
}
