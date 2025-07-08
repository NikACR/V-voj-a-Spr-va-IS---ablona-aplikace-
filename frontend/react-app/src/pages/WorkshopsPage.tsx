import React, { useEffect, useState } from 'react'
import api from '../utils/api'

interface Workshop {
  id_workshop: number
  nazev: string
  popis: string
  cena: number | string
  obrazek_url: string | null  // úplná URL
  datum?: string
  cas?: string
  kapacita: number
}

const WorkshopsPage: React.FC = () => {
  const [list, setList] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<Workshop[]>('/workshops')
      .then(res => setList(res.data))
      .catch(() => setError('Nepodařilo se načíst workshopy.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center mt-8">Načítám workshopy…</div>
  if (error)   return <div className="text-center mt-8 text-red-600">{error}</div>

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Workshopy</h1>
      <ul className="space-y-4">
        {list.map(w => {
          const price = Number(w.cena) || 0
          return (
            <li
              key={w.id_workshop}
              className="border rounded-lg overflow-hidden hover:shadow transition-shadow flex flex-col md:flex-row"
            >
              {w.obrazek_url && (
                <img
                  src={w.obrazek_url}
                  alt={w.nazev}
                  className="w-full md:w-48 h-48 object-cover"
                />
              )}
              <div className="p-4 flex-1">
                <h2 className="text-xl font-semibold">{w.nazev}</h2>
                <p className="mt-2 text-gray-700">{w.popis}</p>
                <div className="mt-2 text-gray-500 text-sm">
                  {w.datum
                    ? new Date(w.datum).toLocaleDateString('cs-CZ', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      })
                    : '—'}
                  {w.cas ? ` v ${w.cas.slice(0,5)}` : ''}
                  {' • '}Kapacita: {w.kapacita}
                </div>
                <div className="mt-2 font-bold text-indigo-600">
                  {price.toFixed(2)} Kč
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default WorkshopsPage
