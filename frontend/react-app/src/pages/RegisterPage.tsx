import React, { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

interface FormData {
  jmeno:    string
  prijmeni: string
  email:    string
  telefon:  string
  password: string
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    jmeno: '', prijmeni: '', email: '', telefon: '', password: ''
  })
  const [error, setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      await api.post('/zakaznik', {
        jmeno: formData.jmeno,
        prijmeni: formData.prijmeni,
        email: formData.email,
        telefon: formData.telefon || undefined,
        password: formData.password
      })
      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Nepodařilo se zaregistrovat. Zkontroluj zadání.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Registrace</h1>
        {error && <div className="bg-red-100 text-red-800 p-2 mb-4 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {['jmeno','prijmeni','email','telefon','password'].map(name => (
            <input
              key={name}
              name={name}
              type={name === 'password' ? 'password' : 'text'}
              placeholder={
                name === 'prijmeni' ? 'Příjmení' :
                name === 'email'    ? 'Email' :
                name === 'telefon'  ? 'Telefon (volitelný)' :
                'Heslo'
              }
              value={(formData as any)[name]}
              onChange={handleChange}
              required={!(name === 'telefon')}
              minLength={name === 'password' ? 8 : undefined}
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white transition ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Registruji…' : 'Registrovat'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
