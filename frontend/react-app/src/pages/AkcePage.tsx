import React, { useEffect, useState } from 'react'
import api from '../utils/api'

interface PodnikovaAkce {
  id_akce: number
  nazev: string
  popis: string
  cena: number
  obrazek_url: string | null  // už obsahuje úplnou URL, např. http://host:8000/static/images/...
  datum: string   // ISO yyyy-mm-dd
  cas: string     // hh:mm:ss
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

  if (loading) return <div className="text-center mt-8">Načítám akce…</div>
  if (error)   return <div className="text-center mt-8 text-red-600">{error}</div>

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Firemní akce</h1>
      <ul className="space-y-4">
        {akce.map(a => (
          <li
            key={a.id_akce}
            className="border rounded-lg overflow-hidden hover:shadow transition-shadow flex flex-col md:flex-row"
          >
            {a.obrazek_url && (
              <img
                src={a.obrazek_url}
                alt={a.nazev}
                className="w-full md:w-48 h-48 object-cover"
              />
            )}
            <div className="p-4 flex-1">
              <h2 className="text-xl font-semibold">{a.nazev}</h2>
              <p className="mt-2 text-gray-700">{a.popis}</p>
              <div className="mt-2 text-gray-500 text-sm">
                {new Date(a.datum).toLocaleDateString('cs-CZ', {
                  day: '2-digit', month: '2-digit', year: 'numeric'
                })}{' '}
                v {a.cas.slice(0,5)}
              </div>
              <div className="mt-2 font-bold text-indigo-600">
                {a.cena.toFixed(2)} Kč
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AkcePage
