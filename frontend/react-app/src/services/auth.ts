// src/services/auth.ts
import api from '../utils/api'

/** Vrátí Authorization hlavičku, pokud máme v localStorage access_token. */
export function authHeader(): Record<string, string> {
  const token = localStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Přihlášení: POST /auth/login, uloží tokeny */
export async function login(email: string, password: string) {
  console.log('[auth.service] POST /auth/login', { email, password })
  try {
    const { data } = await api.post<{
      access_token: string
      refresh_token: string
    }>('/auth/login', { email, password })
    console.log('[auth.service] login response', data)
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    return data
  } catch (err) {
    console.error('[auth.service] login error', err)
    throw err
  }
}

/** Obnovení tokenu: POST /auth/refresh, uloží nový access_token */
export async function refreshToken() {
  console.log('[auth.service] POST /auth/refresh')
  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) throw new Error('Refresh token missing')
  try {
    const { data } = await api.post<{ access_token: string }>(
      '/auth/refresh',
      {},
      { headers: { Authorization: `Bearer ${refresh}` } }
    )
    console.log('[auth.service] refresh response', data)
    localStorage.setItem('access_token', data.access_token)
    return data
  } catch (err) {
    console.error('[auth.service] refresh error', err)
    throw err
  }
}

/** Odhlášení: POST /auth/logout + odstranění tokenů */
export async function logout(): Promise<void> {
  console.log('[auth.service] POST /auth/logout')
  try {
    await api.post('/auth/logout', null, { headers: authHeader() })
  } catch {
    // ignore
  } finally {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
  }
}
