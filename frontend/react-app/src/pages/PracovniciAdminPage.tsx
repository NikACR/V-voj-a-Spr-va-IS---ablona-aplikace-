import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import { Link } from 'react-router-dom'

interface Zakaznik {
  id_zakaznika: number
  jmeno: string
  prijmeni: string
  email: string
}

const PracovniciAdminPage: React.FC = () => {
  const [data, setData]     = useState<Zakaznik[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const resp = await api.get<Zakaznik[]>('/zakaznik?role=staff')
        setData(resp.data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Chyba při načítání')
      } finally {
        setLoading(false)
      }
    }
    fetchStaff()
  }, [])

  if (loading) return <p className="text-center">Načítám pracovníky…</p>
  if (error)   return <p className="text-center text-red-600">{error}</p>

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/admin" className="text-sm text-gray-600 hover:underline">
        ← Zpět na dashboard
      </Link>
      <h1 className="text-2xl font-bold my-4">Pracovníci</h1>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Jméno</th>
            <th className="border px-4 py-2">Příjmení</th>
            <th className="border px-4 py-2">Email</th>
          </tr>
        </thead>
        <tbody>
          {data.map(u => (
            <tr key={u.id_zakaznika} className="hover:bg-gray-50">
              <td className="border px-4 py-2 text-center">{u.id_zakaznika}</td>
              <td className="border px-4 py-2">{u.jmeno}</td>
              <td className="border px-4 py-2">{u.prijmeni}</td>
              <td className="border px-4 py-2">{u.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PracovniciAdminPage
