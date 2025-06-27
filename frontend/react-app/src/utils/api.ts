// src/utils/api.ts

import axios from 'axios'

// Vytvoříme primární axios instanci pro všechny API volání
const api = axios.create({
  baseURL: '/api',                   // prefix pro všechny requesty
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,            // posílá cookies (JWT), pokud je backend takto nakonfigurovaný
})

// Interceptor, který před každým requestem přidá Authorization hlavičku
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// (Volitelné) Response interceptor na zachycení globálních chyb
// api.interceptors.response.use(
//   response => response,
//   error => {
//     // např. 401 – automatický logout nebo přesměrování na /login
//     if (error.response?.status === 401) {
//       localStorage.removeItem('access_token')
//       localStorage.removeItem('refresh_token')
//       window.location.href = '/login'
//     }
//     return Promise.reject(error)
//   }
// )

export default api
