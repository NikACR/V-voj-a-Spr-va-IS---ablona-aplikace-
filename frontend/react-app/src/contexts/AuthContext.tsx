// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import axios from 'axios'                  // <- přidáno
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens
} from '../utils/tokenStorage'

interface User {
  id: number
  email: string
  roles: string[]
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({} as any)
export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate              = useNavigate()

  useEffect(() => {
    const init = async () => {
      const refresh = getRefreshToken()
      if (refresh) {
        try {
          // **tady** místo `api.post` použijeme `axios.post`
          const { data } = await axios.post<{ access_token: string }>(
            '/api/auth/refresh',
            {},
            { headers: { Authorization: `Bearer ${refresh}` } }
          )
          setAccessToken(data.access_token)
          // refresh token se obvykle nemění, ale pro jistotu ho uložíme znovu
          setRefreshToken(refresh)
          // načteme uživatele přes náš api client (který teď používá nový access token)
          const me = await api.get<User>('/auth/me')
          setUser(me.data)
        } catch {
          clearTokens()
          setUser(null)
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const login = async (email: string, password: string) => {
    const resp = await api.post<{
      access_token: string
      refresh_token: string
    }>('/auth/login', { email, password })

    setAccessToken(resp.data.access_token)
    setRefreshToken(resp.data.refresh_token)

    const me = await api.get<User>('/auth/me')
    setUser(me.data)
    navigate('/')
  }

  const logout = () => {
    clearTokens()
    setUser(null)
    navigate('/login')
  }

  if (loading) {
    return <div className="text-center mt-8">Načítám…</div>
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
