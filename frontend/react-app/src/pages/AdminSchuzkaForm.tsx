import React, { useState } from 'react'
import api from '../utils/api'
import { Link, useNavigate } from 'react-router-dom'

const AdminSchuzkaForm: React.FC = () => {
  const [datumCas, setDatumCas] = useState('')
  const [popis, setPopis] = useState('')
  const [idZak, setIdZak] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await api.post('/schuzky', {
        datum_cas: datumCas,
        popis,
        id_zakaznika: Number(idZak),
      })
      navigate('/admin')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Chyba při odesílání')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Link to="/admin" className="text-sm text-gray-600 hover:underline">
        ← Zpět na dashboard
      </Link>
      <h1 className="text-2xl font-bold my-4">Nová schůzka</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Datum a čas</label>
          <input
            type="datetime-local"
            value={datumCas}
            onChange={e => setDatumCas(e.target.value)}
            required
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>Popis</label>
          <textarea
            value={popis}
            onChange={e => setPopis(e.target.value)}
            required
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>ID zákazníka</label>
          <input
            type="number"
            value={idZak}
            onChange={e => setIdZak(e.target.value)}
            required
            className="w-full border px-2 py-1"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Vytvořit
        </button>
      </form>
    </div>
  )
}

export default AdminSchuzkaForm
