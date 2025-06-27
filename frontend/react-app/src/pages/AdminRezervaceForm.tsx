import React, { useState } from 'react'
import api from '../utils/api'
import { Link, useNavigate } from 'react-router-dom'

const AdminRezervaceForm: React.FC = () => {
  const [datumCas, setDatumCas] = useState('')
  const [pocetOsob, setPocetOsob] = useState(1)
  const [idZak, setIdZak] = useState('')
  const [idStul, setIdStul] = useState<string>('')
  const [idSalonek, setIdSalonek] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await api.post('/rezervace', {
        datum_cas: datumCas,
        pocet_osob: pocetOsob,
        id_zakaznika: Number(idZak),
        id_stul: idStul ? Number(idStul) : undefined,
        id_salonek: idSalonek ? Number(idSalonek) : undefined,
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
      <h1 className="text-2xl font-bold my-4">Nová rezervace</h1>
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
          <label>Počet osob</label>
          <input
            type="number"
            min={1}
            value={pocetOsob}
            onChange={e => setPocetOsob(Number(e.target.value))}
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
        <div>
          <label>ID stolu (nepovinné)</label>
          <input
            type="number"
            value={idStul}
            onChange={e => setIdStul(e.target.value)}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>ID salonku (nepovinné)</label>
          <input
            type="number"
            value={idSalonek}
            onChange={e => setIdSalonek(e.target.value)}
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

export default AdminRezervaceForm
