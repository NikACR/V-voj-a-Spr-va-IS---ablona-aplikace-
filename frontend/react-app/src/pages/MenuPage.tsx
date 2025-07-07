import React, { useEffect, useState } from 'react'
import api from '../utils/api'

interface MenuItem {
  id_menu_polozka: number
  nazev: string
  popis: string
  cena: number
  obrazek_url?: string
}

const MenuPage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<MenuItem[]>('/menu')
      .then(r => {
        setItems(r.data)
        setError(null)
      })
      .catch(() => setError('Nepodařilo se načíst jídelní lístek.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Načítám menu…</p>
  if (error)   return <p className="text-red-600">{error}</p>

  return (
    <div>
      <h1>Menu</h1>
      <ul className="space-y-4">
        {items.map(item => (
          <li key={item.id_menu_polozka} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{item.nazev}</h2>
            <p className="text-gray-600">{item.popis}</p>
            <p className="font-bold">{item.cena.toFixed(2)} Kč</p>
            {item.obrazek_url && (
              <img
                src={item.obrazek_url}
                alt={item.nazev}
                className="mt-2 w-32 h-32 object-cover rounded"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MenuPage
