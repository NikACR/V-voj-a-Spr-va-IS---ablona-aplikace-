import axios, { AxiosResponse } from 'axios'
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens
} from './tokenStorage'

export interface VernostniUcet {
  id_ucet: number
  body: number
  datum_zalozeni: string
}

// --- Přidáno pro notifikace ---
export interface ServerNotification {
  id_notifikace: number
  typ: string
  text: string
  datum_cas: string
}

const api = axios.create({
  baseURL: '/api',
})

// Request interceptor: vždy přidá aktuální access token
api.interceptors.request.use(cfg => {
  const token = getAccessToken()
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Response interceptor: pouze pro 401 se pokusí o refresh
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = getRefreshToken()
      if (refresh) {
        try {
          const { data } = await axios.post<{ access_token: string }>(
            '/api/auth/refresh',
            {},
            { headers: { Authorization: `Bearer ${refresh}` } }
          )
          setAccessToken(data.access_token)
          api.defaults.headers.Authorization = `Bearer ${data.access_token}`
          original.headers.Authorization = `Bearer ${data.access_token}`
          return api.request(original)
        } catch {
          clearTokens()
          window.location.href = '/login'
          return Promise.reject(err)
        }
      }
    }
    return Promise.reject(err)
  }
)

export default api

// --- helpery pro body ---
export function fetchPoints() {
  return api.get<VernostniUcet>('/users/me/points')
}

export function redeemPoints(points: number) {
  return api.post<VernostniUcet>('/users/me/redeem', { points })
}

// --- helper pro notifikace ---
export function fetchNotifications(): Promise<ServerNotification[]> {
  return api
    .get<ServerNotification[]>('/users/me/notifications')
    .then((res: AxiosResponse<ServerNotification[]>) => res.data)
}
