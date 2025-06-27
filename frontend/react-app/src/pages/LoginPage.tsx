import React, { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      navigate('/users')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-12">
      <h1 className="text-3xl font-bold mb-6 text-center text-black">
        Přihlášení
      </h1>

      {error && (
        <div className="bg-red-100 text-red-800 p-3 mb-4 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="
            w-full border border-gray-300
            p-3 rounded
            bg-gray-100 text-black
            placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        />

        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Heslo"
          required
          minLength={8}
          className="
            w-full border border-gray-300
            p-3 rounded
            bg-gray-100 text-black
            placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500
          "
        />

        <button
          type="submit"
          disabled={loading}
          className={`
            w-full p-3 rounded
            ${loading
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-white text-black hover:bg-gray-100'}
            border border-gray-300
            transition
          `}
        >
          {loading ? 'Načítám…' : 'Přihlásit se'}
        </button>
      </form>
    </div>
  )
}

export default LoginPage
