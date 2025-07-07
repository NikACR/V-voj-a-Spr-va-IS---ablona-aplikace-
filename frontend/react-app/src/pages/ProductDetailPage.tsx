import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../utils/api'
import Spinner from '../components/Spinner'
import { imageMap, FALLBACK_IMAGE } from '../utils/imageMap'

interface Allergen { /* … */ }
interface MenuItem {
  id_menu_polozka: number
  nazev: string
  popis: string
  cena: number | string
  obrazek_url: string | null
  kategorie: string
  alergeny: Allergen[]
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [item, setItem]     = useState<MenuItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<MenuItem>(`/menu/${id}`)
      .then(r => setItem(r.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner />
  if (!item) return <p>Položka nenalezena</p>

  // stejná logika jako v MenuPage
  const raw = item.obrazek_url || ''
  const src = raw.startsWith('/uploads')
    ? `/api${raw}`                              // pokud bereš z API
    : imageMap[item.id_menu_polozka] || FALLBACK_IMAGE

  return (
    <div className="p-4 space-y-6">
      <Link to="/menu" className="inline-block mb-4 text-indigo-600 hover:underline">
        ← Zpět na menu
      </Link>

      {/* ZDE DÁME OBRÁZEK */}
      <div className="w-full h-72 bg-gray-100 rounded overflow-hidden mb-6">
        <img
          src={src}
          alt={item.nazev}
          className="w-full h-full object-cover"
          onError={e => {
            e.currentTarget.onerror = null
            e.currentTarget.src = FALLBACK_IMAGE
          }}
        />
      </div>

      <h1 className="text-3xl font-bold">{item.nazev}</h1>
      <p className="text-gray-600">{item.popis}</p>
      <p className="mt-4 text-2xl font-semibold">
        { (typeof item.cena === 'number' ? item.cena : parseFloat(item.cena)).toFixed(2) } Kč
      </p>

      {item.alergeny.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.alergeny.map(a => (
            <span key={a.id_alergenu} className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
              {a.nazev}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductDetailPage
