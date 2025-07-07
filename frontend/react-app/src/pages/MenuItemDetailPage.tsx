// src/pages/MenuItemDetailPage.tsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Spinner from '../components/Spinner'
import { useCart } from '../contexts/CartContext'

interface Allergen {
  id_alergenu: number
  nazev: string
}

interface MenuItem {
  id_menu_polozka: number
  nazev: string
  popis: string
  cena: number | string
  obrazek_url?: string
  alergeny: Allergen[]
}

const MenuItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [item, setItem]   = useState<MenuItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const { add } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    api.get<MenuItem>(`/menu/${id}`)
      .then(r => setItem(r.data))
      .catch(() => setError(`Položka ${id} nenalezena.`))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner />
  if (error)   return <p className="text-red-600 text-center mt-8">{error}</p>
  if (!item)  return null

  const price = typeof item.cena === 'string'
    ? parseFloat(item.cena)
    : item.cena

  return (
    <div className="max-w-3xl mx-auto p-4">
      <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline mb-4">
        ← Zpět
      </button>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="h-64 bg-gray-100 flex items-center justify-center">
          {item.obrazek_url
            ? <img src={item.obrazek_url}
                   alt={item.nazev}
                   className="object-cover h-full w-full"/>
            : <span className="text-gray-400">Žádný obrázek</span>
          }
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{item.nazev}</h1>
          <p className="text-gray-700 mb-4">{item.popis}</p>
          <p className="text-xl font-semibold text-indigo-600 mb-4">
            {price.toFixed(2)} Kč
          </p>
          {item.alergeny.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {item.alergeny.map(a => (
                <span key={a.id_alergenu}
                      className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  {a.nazev}
                </span>
              ))}
            </div>
          )}
          <button
            onClick={() => add({ id: item.id_menu_polozka, title: item.nazev, price })}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Přidat do košíku
          </button>
        </div>
      </div>
    </div>
  )
}

export default MenuItemDetailPage
