// src/pages/AkcePage.tsx
import React, { useEffect, useState } from 'react'
import api from '../utils/api'

interface PodnikovaAkce {
  id_akce: number
  nazev: string
  popis: string
  datum: string  // ISO řetězec yyyy-mm-dd
  cas: string    // řetězec hh:mm:ss
}

const AkcePage: React.FC = () => {
  const [akce, setAkce] = useState<PodnikovaAkce[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<PodnikovaAkce[]>('/akce')
      .then(res => setAkce(res.data))
      .catch(() => setError('Nepodařilo se načíst seznam akcí.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center mt-8">Načítám akce…</div>
  }

  if (error) {
    return <div className="text-center mt-8 text-red-600">{error}</div>
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Firemní akce</h1>
      <ul className="space-y-4">
        {akce.map(a => (
          <li
            key={a.id_akce}
            className="border rounded-lg p-4 hover:shadow transition-shadow"
          >
            <h2 className="text-xl font-semibold">{a.nazev}</h2>
            <p className="text-gray-700 mt-1">{a.popis}</p>
            <p className="text-gray-500 mt-2">
              {new Date(a.datum).toLocaleDateString('cs-CZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}{' '}
              v {a.cas.slice(0, 5)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AkcePage

