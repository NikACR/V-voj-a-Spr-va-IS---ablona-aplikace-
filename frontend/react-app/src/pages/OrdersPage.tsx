import React, { useEffect, useState } from 'react'
import api from '../utils/api'

interface Order {
  id_objednavky: number
  stav: string
  celkova_castka: number
  body_ziskane: number
  cas_pripravy: string | null
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    api.get<Order[]>('/objednavky')
      .then(r => {
        setOrders(r.data)
        setError(null)
      })
      .catch(() => setError('Nepodařilo se načíst objednávky.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Načítám objednávky…</p>
  if (error)   return <p className="text-red-600">{error}</p>

  const fmtPrice = (p: number) =>
    Number.isFinite(p) ? p.toFixed(2) : '–'

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Moje objednávky</h1>
      {orders.length === 0 ? (
        <p>Ještě nemáte žádné objednávky.</p>
      ) : (
        orders.map(o => (
          <div key={o.id_objednavky}
               className="border p-4 rounded mb-4 bg-white shadow">
            <h2 className="text-lg font-semibold mb-2">
              Č. {o.id_objednavky}
            </h2>
            <p>
              <span className="font-medium">Celkem:</span>{' '}
              {fmtPrice(o.celkova_castka)} Kč
            </p>
            <p>
              <span className="font-medium">Body získané:</span>{' '}
              {Number.isInteger(o.body_ziskane) ? o.body_ziskane : 0}
            </p>
            <p>
              <span className="font-medium">Hotovo do:</span>{' '}
              {o.cas_pripravy
                ? new Date(o.cas_pripravy).toLocaleTimeString()
                : '–'}
            </p>
            <p>
              <span className="font-medium">Stav:</span> {o.stav}
            </p>
          </div>
        ))
      )}
    </div>
  )
}

export default OrdersPage
