// src/pages/StaffDashboard.tsx
import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import { useNavigate } from 'react-router-dom'

interface Rezervace {
  id_rezervace: number
  datum_cas: string
  pocet_osob: number
  stav_rezervace: string
  zakaznik: {
    jmeno: string
    prijmeni: string
  }
}

const StaffDashboard: React.FC = () => {
  const [rezervace, setRezervace] = useState<Rezervace[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    api
      .get<Rezervace[]>('/rezervace')
      .then(r => setRezervace(r.data))
      .catch(() => setError('Nepodařilo se načíst rezervace.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-center mt-8">Načítám rezervace…</p>
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>

  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Správa rezervací</h1>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow table-auto border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Zákazník</th>
              <th className="border px-4 py-2">Datum a čas</th>
              <th className="border px-4 py-2">Počet osob</th>
              <th className="border px-4 py-2">Stav</th>
              <th className="border px-4 py-2">Akce</th>
            </tr>
          </thead>
          <tbody>
            {rezervace.map(r => (
              <tr key={r.id_rezervace} className="hover:bg-gray-50">
                <td className="border px-4 py-2 text-center">{r.id_rezervace}</td>
                <td className="border px-4 py-2">
                  {r.zakaznik.jmeno} {r.zakaznik.prijmeni}
                </td>
                <td className="border px-4 py-2">
                  {new Date(r.datum_cas).toLocaleString()}
                </td>
                <td className="border px-4 py-2 text-center">{r.pocet_osob}</td>
                <td className="border px-4 py-2 text-center">{r.stav_rezervace}</td>
                <td className="border px-4 py-2 text-center">
                  <button
                    onClick={() => navigate(`/reservations/${r.id_rezervace}`)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StaffDashboard
