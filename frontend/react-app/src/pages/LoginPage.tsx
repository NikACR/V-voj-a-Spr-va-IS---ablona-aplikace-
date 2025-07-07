// src/pages/LoginPage.tsx
import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const LoginPage: React.FC = () => {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const { login, loading }      = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      // navigate('/') proběhne uvnitř login()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Přihlášení selhalo')
    }
  }

  return (
    <div className="min-h-screen flex items-start pt-20 justify-center bg-white">
      <div className="w-full max-w-md p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Přihlášení</h1>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" required
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Heslo" required
            className="w-full border px-3 py-2 rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white transition ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Načítám…' : 'Přihlásit'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
